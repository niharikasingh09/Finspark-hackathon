# FinSpark Feature Intelligence Framework - Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to the project
cd finspark-prototype

# Install backend dependencies
cd backend
npm install

# Install dashboard dependencies
cd ../dashboard
npm install

# Return to root
cd ..
```

### Running the Prototype

**Option 1: Run all components in separate terminals**

```bash
# Terminal 1 - Backend Server
cd backend
npm start
# Server runs on http://localhost:3000

# Terminal 2 - Dashboard
cd dashboard
npm run dev
# Dashboard runs on http://localhost:5173

# Terminal 3 - Demo App
# Just open demo-app/index.html in your browser
```

**Option 2: Quick demo with sample data**

The backend automatically seeds sample data on startup, so you can immediately:

1. Start backend: `cd backend && npm start`
2. Start dashboard: `cd dashboard && npm run dev`
3. Open demo app: `demo-app/index.html`
4. Interact with features in the demo app
5. Watch analytics appear in the dashboard

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────┐
│  DEMO LENDING APP (demo-app/index.html)                 │
│  • Simulates enterprise lending platform                │
│  • Instrumented with Feature Tracker SDK                │
│  • 10 realistic features (loan, credit check, etc.)     │
└──────────────────┬──────────────────────────────────────┘
                   │ Events (batched, privacy-aware)
                   ▼
┌─────────────────────────────────────────────────────────┐
│  EVENT COLLECTION API (backend/server.js)               │
│  • Receives events via REST API                         │
│  • Handles Cloud vs On-Prem differently                 │
│  • Stores raw events (Cloud) or aggregates (On-Prem)    │
│  • Provides analytics endpoints                         │
└──────────────────┬──────────────────────────────────────┘
                   │ Analytics queries
                   ▼
┌─────────────────────────────────────────────────────────┐
│  ANALYTICS DASHBOARD (dashboard/src/App.jsx)            │
│  • Feature usage heatmaps                               │
│  • Journey funnel analysis                              │
│  • Tenant comparison                                    │
│  • License ROI insights                                 │
│  • Real-time event stream                               │
│  • Compliance controls                                  │
└─────────────────────────────────────────────────────────┘
```

## Demo Flow

### Scenario 1: Feature Discovery
1. Open the Demo App
2. Click through different features
3. Switch between Cloud/On-Prem mode
4. Open the Dashboard
5. View Feature Heatmap tab - see which features are being used

### Scenario 2: Journey Analytics
1. In Demo App, follow the loan application journey:
   - Dashboard → Loan Application → Credit Check → Document Upload → Approval
2. In Dashboard, go to Journey Funnel tab
3. See the conversion funnel with drop-off points

### Scenario 3: Multi-Tenant Comparison
1. Switch tenants in Demo App (Bank Alpha, Beta, Gamma)
2. Generate different usage patterns for each
3. In Dashboard, view Tenant Comparison tab
4. Compare usage across different banks

### Scenario 4: License ROI
1. In Dashboard, go to License ROI tab
2. See which features are licensed but unused
3. Identify optimization opportunities
4. View recommendations

### Scenario 5: Compliance
1. In Dashboard, go to Compliance tab
2. Toggle telemetry on/off
3. Change privacy levels
4. View audit logs of all changes

## Key Features Demonstrated

### 1. Deployment-Aware Architecture
- **Cloud Mode**: Stores raw events with full detail
- **On-Prem Mode**: Aggregates locally, only sends anonymized summaries
- Switch between modes in real-time

### 2. Privacy & Compliance
- **Three Privacy Levels**:
  - Strict: Full PII hashing
  - Standard: Partial masking
  - Relaxed: Minimal masking
- Configurable telemetry on/off
- Complete audit trail

### 3. Multi-Tenant Isolation
- Each tenant's data is isolated
- Compare usage across tenants
- Tenant-specific analytics

### 4. Journey Tracking
- Automatic correlation of user actions
- Visual funnel analysis
- Drop-off identification

### 5. ROI Analysis
- License vs usage comparison
- Identify unused licensed features
- Cost optimization recommendations

## API Endpoints

### Event Collection
```
POST /api/events
Body: {
  events: [...],
  deploymentMode: "cloud" | "onprem",
  tenantId: "tenant-id"
}
```

### Analytics
```
GET /api/analytics/heatmap?tenantId=X
GET /api/analytics/funnel?tenantId=X&journey=step1,step2,step3
GET /api/analytics/tenant-comparison
GET /api/analytics/roi?tenantId=X
GET /api/analytics/stream?limit=50
```

### Compliance
```
POST /api/compliance/settings
GET /api/compliance/audit-log?tenantId=X
POST /api/features/config
```

## Customization

### Adding New Features
1. Update `demo-app/index.html` with new feature UI
2. Add `data-feature="feature-name"` attribute
3. Feature is automatically tracked

### Modifying Privacy Rules
Edit `sdk/feature-tracker.js`:
```javascript
sanitizeMetadata(metadata) {
  // Add custom PII detection logic
}
```

### Custom Analytics
Add new endpoints in `backend/server.js`:
```javascript
app.get('/api/analytics/custom', (req, res) => {
  // Your custom analytics logic
});
```

## Troubleshooting

### Backend won't start
- Check port 3000 is available
- Run `npm install` in backend directory

### Dashboard shows no data
- Ensure backend is running
- Check browser console for CORS errors
- Verify API_BASE URL in dashboard/src/App.jsx

### Events not appearing
- Check tracking is enabled in demo app
- Check browser console for errors
- Verify backend is receiving events (check terminal logs)

## Production Considerations

This is a prototype for demonstration. For production:

1. **Database**: Replace SQLite with PostgreSQL/MySQL
2. **Authentication**: Add proper auth/authorization
3. **Rate Limiting**: Implement request throttling
4. **Data Retention**: Add automated cleanup
5. **Monitoring**: Add logging and alerting
6. **Encryption**: Encrypt data at rest and in transit
7. **Scalability**: Add caching layer, message queue
8. **High Availability**: Deploy across multiple regions

## Next Steps

1. Review the architecture diagram in README.md
2. Run through all demo scenarios
3. Explore the code in each component
4. Customize for your specific use case
5. Prepare your presentation using docs/presentation.md
