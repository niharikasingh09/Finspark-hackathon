# FinSpark Feature Intelligence Framework
## Technical Architecture Document

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │   API Client │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │  Feature Tracker SDK    │                        │
│              │  - Event capture        │                        │
│              │  - Batching             │                        │
│              │  - Privacy masking      │                        │
│              │  - Journey tracking     │                        │
│              └────────────┬────────────┘                        │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                  HTTPS POST │ (Batched Events)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   EVENT COLLECTION LAYER                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Load Balancer / API Gateway                │    │
│  └────────────────────┬───────────────────────────────────┘    │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐    │
│  │          Event Collection Service (Express)             │    │
│  │  - Deployment mode detection                            │    │
│  │  - Tenant isolation                                     │    │
│  │  - Input validation                                     │    │
│  │  - Rate limiting                                        │    │
│  └────────────┬──────────────────────┬────────────────────┘    │
│               │                      │                          │
│      Cloud Mode                On-Prem Mode                     │
│               │                      │                          │
│  ┌────────────▼──────────┐  ┌───────▼──────────────┐          │
│  │  Raw Event Storage    │  │  Local Aggregator    │          │
│  │  (All event details)  │  │  (Summary stats only)│          │
│  └────────────┬──────────┘  └───────┬──────────────┘          │
└───────────────┼─────────────────────┼──────────────────────────┘
                │                     │
                │                     │ (Anonymized summaries)
                └──────────┬──────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    ANALYTICS ENGINE                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Analytics Processing Pipeline               │   │
│  │  - Event aggregation                                     │   │
│  │  - Journey correlation                                   │   │
│  │  - Metric calculation                                    │   │
│  │  - Trend analysis                                        │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │              Analytics Database (SQLite/PostgreSQL)      │   │
│  │  - Events table                                          │   │
│  │  - Aggregated metrics table                              │   │
│  │  - Feature configuration table                           │   │
│  │  - Audit log table                                       │   │
│  └─────────────────────────┬───────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    REST API │
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                   PRESENTATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Analytics Dashboard (React SPA)                 │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │   │
│  │  │  Heatmap   │ │   Funnel   │ │  Tenants   │           │   │
│  │  └────────────┘ └────────────┘ └────────────┘           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │   │
│  │  │    ROI     │ │   Stream   │ │ Compliance │           │   │
│  │  └────────────┘ └────────────┘ └────────────┘           │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Details

### 2.1 Feature Tracker SDK

**Purpose:** Lightweight client-side instrumentation for feature tracking

**Key Capabilities:**
- Automatic feature detection via `data-feature` attributes
- Manual feature tracking via API
- Journey path correlation
- Event batching (configurable batch size)
- Privacy-aware data collection
- Deployment mode awareness

**Technical Implementation:**
```javascript
class FeatureTracker {
  // Core methods
  trackFeature(name, metadata)     // Track feature invocation
  trackJourney(step, data)         // Track journey progression
  trackDropoff(feature, reason)    // Track abandonment
  trackConfiguration(features)     // Register feature config
  
  // Privacy & batching
  maskPII(value)                   // Apply privacy rules
  sanitizeMetadata(data)           // Remove sensitive fields
  flush()                          // Send batched events
}
```

**Event Schema:**
```javascript
{
  eventType: 'feature_invocation',
  featureName: 'loan-application',
  timestamp: 1234567890,
  sessionId: 'session_xyz',
  tenantId: 'bank-alpha',
  deploymentMode: 'cloud',
  userId: 'hashed_12345',
  metadata: {
    category: 'lending',
    elementType: 'button'
  },
  journey: [
    { step: 'dashboard', timestamp: 1234567890 },
    { step: 'loan-application', timestamp: 1234567900 }
  ],
  context: {
    url: 'https://app.example.com/apply',
    viewport: { width: 1920, height: 1080 }
  }
}
```

**Performance:**
- SDK size: ~15KB minified
- Overhead per event: <1ms
- Network impact: Batched requests every 5 seconds
- Memory footprint: <500KB

---

### 2.2 Event Collection Service

**Purpose:** Central ingestion point for telemetry events

**Architecture Pattern:** REST API with dual-mode processing

**Key Endpoints:**

```
POST /api/events
  - Accepts batched events
  - Validates payload
  - Routes to cloud/on-prem handler
  - Returns acknowledgment

GET /api/analytics/heatmap
  - Returns feature usage statistics
  - Supports tenant filtering
  - Time range filtering

GET /api/analytics/funnel
  - Returns journey funnel data
  - Calculates conversion rates
  - Identifies drop-off points

GET /api/analytics/tenant-comparison
  - Compares usage across tenants
  - Aggregates by deployment mode

GET /api/analytics/roi
  - License vs usage analysis
  - Identifies unused features

POST /api/compliance/settings
  - Updates telemetry configuration
  - Logs audit trail

GET /api/compliance/audit-log
  - Returns configuration history
```

**Processing Logic:**

**Cloud Mode:**
```javascript
handleCloudEvents(events) {
  // Store raw events with full detail
  events.forEach(event => {
    db.insert('events', {
      ...event,
      deployment_mode: 'cloud'
    });
  });
}
```

**On-Premise Mode:**
```javascript
handleOnPremEvents(events) {
  // Aggregate locally, anonymize
  const aggregated = groupByFeature(events);
  
  aggregated.forEach(group => {
    db.insert('aggregated_metrics', {
      tenant_id: tenantId,
      feature_name: group.feature,
      invocation_count: group.count,
      unique_sessions: group.sessions.size,
      unique_users: hashSet(group.users), // Hash for privacy
      period_start: group.minTimestamp,
      period_end: group.maxTimestamp
    });
  });
}
```

**Scalability:**
- Horizontal scaling: Stateless service
- Load balancing: Round-robin
- Rate limiting: 1000 req/min per tenant
- Database sharding: By tenant_id

---

### 2.3 Analytics Engine

**Purpose:** Process events into actionable insights

**Core Algorithms:**

**1. Journey Correlation**
```javascript
correlateJourney(events) {
  // Group events by session
  const sessions = groupBy(events, 'session_id');
  
  // Build journey paths
  sessions.forEach(session => {
    const journey = sortBy(session.events, 'timestamp')
      .map(e => e.feature_name);
    
    // Analyze funnel
    const funnel = calculateFunnel(journey, targetSteps);
  });
}
```

**2. Drop-off Detection**
```javascript
detectDropoffs(journeys, expectedPath) {
  const dropoffPoints = [];
  
  journeys.forEach(journey => {
    for (let i = 0; i < expectedPath.length - 1; i++) {
      if (journey.includes(expectedPath[i]) && 
          !journey.includes(expectedPath[i + 1])) {
        dropoffPoints.push({
          step: expectedPath[i],
          nextStep: expectedPath[i + 1],
          dropoffRate: calculateRate()
        });
      }
    }
  });
  
  return dropoffPoints;
}
```

**3. ROI Calculation**
```javascript
calculateROI(features, usage) {
  return features.map(feature => {
    const isLicensed = feature.licensed;
    const usageCount = usage[feature.name] || 0;
    
    return {
      feature: feature.name,
      status: isLicensed && usageCount === 0 
        ? 'unused_licensed'
        : isLicensed && usageCount > 0
        ? 'active'
        : 'unlicensed',
      potentialSavings: isLicensed && usageCount === 0
        ? estimateLicenseCost(feature)
        : 0
    };
  });
}
```

---

### 2.4 Dashboard (React)

**Architecture:** Single-page application with component-based design

**State Management:**
```javascript
// Custom hooks for data fetching
const useAnalytics = (endpoint, params) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData(endpoint, params)
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint, params]);
  
  return { data, loading };
};
```

**Visualization Library:** Recharts
- Responsive charts
- Interactive tooltips
- Real-time updates

**Component Hierarchy:**
```
Dashboard
├── Header
│   ├── TenantSelector
│   └── DeploymentFilter
├── StatCards
│   └── StatCard × 4
└── TabContainer
    ├── OverviewTab
    │   ├── TopFeaturesChart
    │   └── DeploymentDistribution
    ├── FeaturesTab
    │   └── HeatmapChart
    ├── FunnelTab
    │   └── FunnelChart
    ├── TenantsTab
    │   └── ComparisonTable
    ├── ROITab
    │   └── LicenseTable
    ├── StreamTab
    │   └── EventList
    └── ComplianceTab
        ├── SettingsForm
        └── AuditLog
```

---

## 3. Data Models

### 3.1 Database Schema

**Events Table (Cloud Mode)**
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  event_type TEXT NOT NULL,
  feature_name TEXT,
  timestamp INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  deployment_mode TEXT NOT NULL,
  user_id TEXT,
  metadata TEXT,  -- JSON
  journey_path TEXT,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_timestamp (tenant_id, timestamp),
  INDEX idx_feature (feature_name),
  INDEX idx_session (session_id)
);
```

**Aggregated Metrics Table (On-Prem Mode)**
```sql
CREATE TABLE aggregated_metrics (
  id INTEGER PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  deployment_mode TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  invocation_count INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  avg_duration REAL DEFAULT 0,
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_period (tenant_id, period_start, period_end)
);
```

**Feature Configuration Table**
```sql
CREATE TABLE feature_configs (
  id INTEGER PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT 1,
  licensed BOOLEAN DEFAULT 1,
  version TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id, feature_name)
);
```

**Audit Log Table**
```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,  -- JSON
  user_role TEXT,
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_timestamp (tenant_id, timestamp)
);
```

---

## 4. Security & Privacy

### 4.1 Privacy Levels

**Strict Mode:**
- All user IDs hashed with SHA-256
- Minimal metadata collection
- No session replay capability
- Aggregate-only reporting

**Standard Mode:**
- Partial user ID masking (e.g., user_1234 → us****34)
- Contextual metadata allowed
- Session-level analytics
- Balance between privacy and insights

**Relaxed Mode:**
- Minimal masking
- Full metadata collection
- Detailed session analytics
- For internal/non-production environments

### 4.2 PII Detection & Masking

```javascript
const SENSITIVE_FIELDS = [
  'password', 'ssn', 'creditCard', 'pin', 
  'secret', 'token', 'email', 'phone'
];

sanitizeMetadata(metadata) {
  const sanitized = { ...metadata };
  
  Object.keys(sanitized).forEach(key => {
    // Check if field name contains sensitive keyword
    if (SENSITIVE_FIELDS.some(field => 
        key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
    
    // Truncate long strings
    if (typeof sanitized[key] === 'string' && 
        sanitized[key].length > 100) {
      sanitized[key] = sanitized[key].slice(0, 100) + '...';
    }
  });
  
  return sanitized;
}
```

### 4.3 Authentication & Authorization

**API Authentication:**
- JWT tokens for API access
- Tenant-scoped tokens
- Role-based access control

**Dashboard Access:**
- SSO integration (SAML/OAuth)
- Role-based views
- Audit logging

---

## 5. Performance & Scalability

### 5.1 Performance Targets

- API latency: <100ms (p99)
- Dashboard load: <2 seconds
- Event ingestion: 10,000 events/second
- Real-time updates: <5 second delay

### 5.2 Scaling Strategy

**Horizontal Scaling:**
- Stateless API servers
- Database read replicas
- CDN for dashboard assets

**Vertical Scaling:**
- Database optimization
- Index tuning
- Query caching

**Caching Strategy:**
- Redis for analytics cache
- TTL: 60 seconds for real-time data
- TTL: 300 seconds for historical data

---

## 6. Deployment

### 6.1 Infrastructure Requirements

**Minimum (Prototype):**
- 2 vCPU, 4GB RAM
- 20GB SSD storage
- Node.js 16+

**Production (Small):**
- 4 vCPU, 8GB RAM
- 100GB SSD storage
- Load balancer
- Database (PostgreSQL)

**Production (Large):**
- 8+ vCPU, 16GB+ RAM
- 500GB+ SSD storage
- Multi-region deployment
- Managed database cluster
- Redis cluster
- Message queue (RabbitMQ/Kafka)

### 6.2 Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
  
  dashboard:
    build: ./dashboard
    ports:
      - "5173:5173"
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=finspark
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 7. Monitoring & Operations

### 7.1 Health Checks

```javascript
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: Date.now(),
    checks: {
      database: checkDatabase(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  res.json(health);
});
```

### 7.2 Metrics to Monitor

- Event ingestion rate
- API response times
- Database query performance
- Error rates
- Cache hit ratios
- Disk usage

### 7.3 Logging

```javascript
// Structured logging
logger.info('Event batch received', {
  tenantId,
  eventCount,
  deploymentMode,
  batchId
});
```

---

## 8. Future Enhancements

### 8.1 Phase 2 Features

- **Predictive Analytics:** ML-based churn prediction
- **Anomaly Detection:** Automated usage pattern alerts
- **Custom Dashboards:** User-configurable widgets
- **Export Capabilities:** PDF/Excel report generation
- **Webhooks:** Real-time notifications

### 8.2 Scalability Improvements

- **Event Streaming:** Kafka/Kinesis integration
- **Time-series DB:** InfluxDB for metrics
- **Distributed Tracing:** OpenTelemetry
- **CDN:** CloudFront for global delivery

---

## 9. Testing Strategy

### 9.1 Unit Tests

```javascript
describe('FeatureTracker', () => {
  it('should batch events correctly', () => {
    const tracker = new FeatureTracker({ batchSize: 5 });
    
    for (let i = 0; i < 4; i++) {
      tracker.trackFeature('test-feature');
    }
    
    expect(tracker.eventQueue.length).toBe(4);
  });
});
```

### 9.2 Integration Tests

```javascript
describe('Event Collection API', () => {
  it('should store cloud events', async () => {
    const res = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        events: [testEvent],
        deploymentMode: 'cloud',
        tenantId: 'test-tenant'
      })
    });
    
    expect(res.status).toBe(200);
  });
});
```

### 9.3 Load Tests

- Simulate 10K concurrent users
- Test event ingestion throughput
- Measure dashboard performance under load

---

## 10. Documentation

### 10.1 API Documentation

- OpenAPI/Swagger spec
- Interactive API explorer
- Code examples in multiple languages

### 10.2 SDK Documentation

- Integration guide
- Code samples
- Best practices
- Troubleshooting

---

**End of Technical Architecture Document**
