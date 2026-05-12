import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, TrendingUp, Users, Shield, Database, Settings,
  AlertCircle, CheckCircle, XCircle, Cloud, Server
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [heatmapData, setHeatmapData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [tenantData, setTenantData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [eventStream, setEventStream] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('bank-alpha');
  const [deploymentFilter, setDeploymentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [selectedTenant, deploymentFilter]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchHeatmap(),
        fetchFunnel(),
        fetchTenantComparison(),
        fetchROI(),
        fetchEventStream()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchHeatmap = async () => {
    const res = await fetch(`${API_BASE}/analytics/heatmap?tenantId=${selectedTenant}`);
    const data = await res.json();
    setHeatmapData(data.data || []);
  };

  const fetchFunnel = async () => {
    const journey = 'loan-application,credit-check,document-upload,loan-approval,disbursement';
    const res = await fetch(`${API_BASE}/analytics/funnel?tenantId=${selectedTenant}&journey=${journey}`);
    const data = await res.json();
    setFunnelData(data.data || []);
  };

  const fetchTenantComparison = async () => {
    const res = await fetch(`${API_BASE}/analytics/tenant-comparison`);
    const data = await res.json();
    setTenantData(data.data || []);
  };

  const fetchROI = async () => {
    const res = await fetch(`${API_BASE}/analytics/roi?tenantId=${selectedTenant}`);
    const data = await res.json();
    setRoiData(data.data || []);
  };

  const fetchEventStream = async () => {
    const res = await fetch(`${API_BASE}/analytics/stream?limit=20`);
    const data = await res.json();
    setEventStream(data.events || []);
  };

  // Calculate summary stats
  const stats = {
    totalFeatures: heatmapData.length,
    totalInvocations: heatmapData.reduce((sum, f) => sum + f.invocation_count, 0),
    activeTenants: new Set(tenantData.map(t => t.tenant_id)).size,
    unusedLicenses: roiData.filter(f => f.status === 'unused_licensed').length
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px 40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              FinSpark Feature Intelligence
            </h1>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>
              Enterprise Analytics & Usage Insights
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              style={{ 
                padding: '8px 15px', 
                borderRadius: '6px', 
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="bank-alpha">Bank Alpha</option>
              <option value="bank-beta">Bank Beta</option>
              <option value="bank-gamma">Bank Gamma</option>
            </select>
            <select
              value={deploymentFilter}
              onChange={(e) => setDeploymentFilter(e.target.value)}
              style={{ 
                padding: '8px 15px', 
                borderRadius: '6px', 
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Deployments</option>
              <option value="cloud">Cloud Only</option>
              <option value="onprem">On-Premise Only</option>
            </select>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div style={{ padding: '30px 40px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <StatCard 
            title="Total Features" 
            value={stats.totalFeatures} 
            icon={<Activity />}
            color="#667eea"
          />
          <StatCard 
            title="Total Invocations" 
            value={stats.totalInvocations.toLocaleString()} 
            icon={<TrendingUp />}
            color="#764ba2"
          />
          <StatCard 
            title="Active Tenants" 
            value={stats.activeTenants} 
            icon={<Users />}
            color="#f093fb"
          />
          <StatCard 
            title="Unused Licenses" 
            value={stats.unusedLicenses} 
            icon={<AlertCircle />}
            color="#ff6b6b"
            warning={stats.unusedLicenses > 0}
          />
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </Tab>
          <Tab active={activeTab === 'features'} onClick={() => setActiveTab('features')}>
            🎯 Feature Heatmap
          </Tab>
          <Tab active={activeTab === 'funnel'} onClick={() => setActiveTab('funnel')}>
            📈 Journey Funnel
          </Tab>
          <Tab active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')}>
            🏢 Tenant Comparison
          </Tab>
          <Tab active={activeTab === 'roi'} onClick={() => setActiveTab('roi')}>
            💰 License ROI
          </Tab>
          <Tab active={activeTab === 'stream'} onClick={() => setActiveTab('stream')}>
            🔴 Live Stream
          </Tab>
          <Tab active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')}>
            🔒 Compliance
          </Tab>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab heatmapData={heatmapData} tenantData={tenantData} />}
          {activeTab === 'features' && <FeaturesTab data={heatmapData} />}
          {activeTab === 'funnel' && <FunnelTab data={funnelData} />}
          {activeTab === 'tenants' && <TenantsTab data={tenantData} />}
          {activeTab === 'roi' && <ROITab data={roiData} />}
          {activeTab === 'stream' && <StreamTab events={eventStream} />}
          {activeTab === 'compliance' && <ComplianceTab tenant={selectedTenant} />}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, warning }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: warning ? '2px solid #ff6b6b' : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{value}</p>
        </div>
        <div style={{ color: color, opacity: 0.8 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 24px',
        border: 'none',
        background: active ? 'white' : 'transparent',
        color: active ? '#667eea' : '#666',
        fontWeight: active ? '600' : '400',
        fontSize: '14px',
        cursor: 'pointer',
        borderRadius: '8px 8px 0 0',
        borderBottom: active ? '3px solid #667eea' : 'none',
        transition: 'all 0.3s'
      }}
    >
      {children}
    </button>
  );
}

function OverviewTab({ heatmapData, tenantData }) {
  const topFeatures = heatmapData
    .sort((a, b) => b.invocation_count - a.invocation_count)
    .slice(0, 5);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
      <Card title="Top 5 Most Used Features">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topFeatures}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="feature_name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="invocation_count" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Deployment Distribution">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tenantData}
              dataKey="total_events"
              nameKey="deployment_mode"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {tenantData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#667eea', '#764ba2'][index % 2]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function FeaturesTab({ data }) {
  const chartData = data.slice(0, 15);

  return (
    <Card title="Feature Usage Heatmap" subtitle="Invocations by feature across all sessions">
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="feature_name" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="invocation_count" fill="#667eea" name="Invocations" />
          <Bar dataKey="unique_sessions" fill="#764ba2" name="Unique Sessions" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function FunnelTab({ data }) {
  return (
    <div>
      <Card title="Loan Application Journey Funnel" subtitle="Track conversion rates through the lending process">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="reached" fill="#667eea" name="Reached" />
            <Bar dataKey="dropoff" fill="#ff6b6b" name="Drop-off" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {data.map((step, idx) => (
          <div key={idx} style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}>
            <h4 style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
              {step.step}
            </h4>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
              {step.conversionRate}%
            </p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {step.reached} reached, {step.dropoff} dropped off
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TenantsTab({ data }) {
  return (
    <div>
      <Card title="Tenant Comparison" subtitle="Compare usage patterns across different banks">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tenant_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_events" fill="#667eea" name="Total Events" />
            <Bar dataKey="features_used" fill="#764ba2" name="Features Used" />
            <Bar dataKey="total_sessions" fill="#f093fb" name="Sessions" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ marginTop: '20px' }}>
        <table style={{ width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Tenant</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Deployment</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Events</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Features</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Sessions</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Users</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tenant, idx) => (
              <tr key={idx} style={{ borderTop: '1px solid #e0e0e0' }}>
                <td style={{ padding: '12px' }}>{tenant.tenant_id}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    background: tenant.deployment_mode === 'cloud' ? '#e3f2fd' : '#fff3e0',
                    color: tenant.deployment_mode === 'cloud' ? '#1976d2' : '#f57c00',
                    fontSize: '12px'
                  }}>
                    {tenant.deployment_mode === 'cloud' ? <Cloud size={12} /> : <Server size={12} />} {tenant.deployment_mode}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{tenant.total_events}</td>
                <td style={{ padding: '12px' }}>{tenant.features_used}</td>
                <td style={{ padding: '12px' }}>{tenant.total_sessions}</td>
                <td style={{ padding: '12px' }}>{tenant.total_users}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ROITab({ data }) {
  const summary = {
    licensed: data.filter(f => f.licensed).length,
    active: data.filter(f => f.status === 'active').length,
    unused: data.filter(f => f.status === 'unused_licensed').length
  };

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <StatCard title="Licensed Features" value={summary.licensed} icon={<CheckCircle />} color="#4caf50" />
        <StatCard title="Actively Used" value={summary.active} icon={<Activity />} color="#667eea" />
        <StatCard title="Unused Licenses" value={summary.unused} icon={<XCircle />} color="#ff6b6b" warning={summary.unused > 0} />
      </div>

      <Card title="Feature License vs Usage Analysis" subtitle="Identify optimization opportunities">
        <table style={{ width: '100%' }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Feature</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Licensed</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Enabled</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Usage Count</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((feature, idx) => (
              <tr key={idx} style={{ borderTop: '1px solid #e0e0e0' }}>
                <td style={{ padding: '12px' }}>{feature.feature_name}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 
                      feature.status === 'active' ? '#e8f5e9' :
                      feature.status === 'unused_licensed' ? '#ffebee' : '#f5f5f5',
                    color:
                      feature.status === 'active' ? '#2e7d32' :
                      feature.status === 'unused_licensed' ? '#c62828' : '#666',
                    fontSize: '12px'
                  }}>
                    {feature.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{feature.licensed ? '✅' : '❌'}</td>
                <td style={{ padding: '12px' }}>{feature.enabled ? '✅' : '❌'}</td>
                <td style={{ padding: '12px' }}>{feature.usage_count}</td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                  {feature.status === 'unused_licensed' ? '⚠️ Consider removing license' : 
                   feature.status === 'active' ? '✅ Good ROI' : 
                   '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function StreamTab({ events }) {
  return (
    <Card title="Live Event Stream" subtitle="Real-time feature invocation monitoring">
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {events.map((event, idx) => (
          <div key={idx} style={{
            padding: '12px',
            borderBottom: '1px solid #e0e0e0',
            fontSize: '13px',
            fontFamily: 'monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#667eea' }}>
                {event.event_type}
              </span>
              <span style={{ color: '#888' }}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={{ color: '#666' }}>
              Feature: <strong>{event.feature_name || 'N/A'}</strong> | 
              Session: {event.session_id?.slice(0, 20)}... | 
              Tenant: {event.tenant_id} | 
              Mode: {event.deployment_mode}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ComplianceTab({ tenant }) {
  const [settings, setSettings] = useState({
    enabled: true,
    privacyLevel: 'standard',
    dataRetention: 90
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAuditLogs();
  }, [tenant]);

  const fetchAuditLogs = async () => {
    const res = await fetch(`${API_BASE}/compliance/audit-log?tenantId=${tenant}`);
    const data = await res.json();
    setLogs(data.logs || []);
  };

  const handleSettingChange = async (key, value) => {
    setSettings({ ...settings, [key]: value });
    
    await fetch(`${API_BASE}/compliance/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: tenant,
        enabled: key === 'enabled' ? value : settings.enabled,
        privacyLevel: key === 'privacyLevel' ? value : settings.privacyLevel,
        userRole: 'admin'
      })
    });

    fetchAuditLogs();
  };

  return (
    <div>
      <Card title="Telemetry & Privacy Controls" subtitle="Configure data collection and privacy settings">
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
              <span style={{ fontSize: '16px', fontWeight: '500' }}>Enable Telemetry Collection</span>
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Privacy Level
            </label>
            <select
              value={settings.privacyLevel}
              onChange={(e) => handleSettingChange('privacyLevel', e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: '2px solid #e0e0e0',
                fontSize: '14px',
                width: '300px'
              }}
            >
              <option value="strict">Strict (Full PII Hashing)</option>
              <option value="standard">Standard (Partial Masking)</option>
              <option value="relaxed">Relaxed (Minimal Masking)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Data Retention (Days)
            </label>
            <input
              type="number"
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: '2px solid #e0e0e0',
                fontSize: '14px',
                width: '300px'
              }}
            />
          </div>
        </div>
      </Card>

      <div style={{ marginTop: '20px' }}>
        <Card title="Audit Log" subtitle="Recent configuration changes and access events">
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{
                padding: '12px',
                borderBottom: '1px solid #e0e0e0',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600' }}>{log.action}</span>
                  <span style={{ color: '#888' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  Role: {log.user_role} | Details: {log.details || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
      {subtitle && <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>{subtitle}</p>}
      {children}
    </div>
  );
}

export default Dashboard;
