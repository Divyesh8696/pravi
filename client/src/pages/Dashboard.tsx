import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Map from '../components/Map';
import { Link } from 'react-router-dom';
import {
  Route, MapPin, CheckCircle2, AlertTriangle,
  Truck, Wrench, ClipboardList, Users, Building2,
  ArrowLeftRight, Leaf, Activity, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CitizenDashboard from './CitizenDashboard';

function KpiCard({
  icon, iconBg, label, value, sub, delta, deltaType
}: {
  icon: React.ReactNode; iconBg: string; label: string;
  value: string | number; sub?: string; delta?: string; deltaType?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className="kpi-card-icon" style={{ background: iconBg }}>{icon}</div>
        {delta && (
          <span className={`kpi-card-delta kpi-delta-${deltaType || 'neutral'}`}>
            {deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : ''}{delta}
          </span>
        )}
      </div>
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
      {sub && <div className="kpi-card-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => fetch('/api/dashboard/kpis').then(r => r.json())
  });
  const { data: mapAssetsData } = useQuery({
    queryKey: ['dashboard-map-assets'],
    queryFn: () => fetch('/api/dashboard/map-assets').then(r => r.json()),
    enabled: user?.role !== 'CITIZEN'
  });
  const { data: routesData } = useQuery({
    queryKey: ['routes'],
    queryFn: () => fetch('/api/routes').then(r => r.json()),
    enabled: user?.role !== 'CITIZEN'
  });

  if (user?.role === 'CITIZEN') return <CitizenDashboard />;
  if (isLoading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>Loading Command Center…</div>;

  const kpis = kpiData?.data;
  if (!kpis) return <div style={{ padding: 32, color: 'var(--crit)' }}>Failed to load dashboard data.</div>;

  const liveMapPoints = mapAssetsData?.data || [];
  const routes = routesData?.data || [];
  const vehicles = kpis.vehicles || { total: 0, active: 0, breakdown: 0, maintenance: 0 };
  const vehicleAvailable = Math.max(0, vehicles.total - vehicles.active - vehicles.breakdown - vehicles.maintenance);

  const ic = { color: 'white' as const, width: 14, height: 14 };

  const alerts = [
    { id: 1, title: 'Vehicle VEH-0241 Breakdown', sub: 'Zone 4 · R-402 · 10 mins ago', severity: 'high', dot: '#ef4444' },
    { id: 2, title: 'Missed Collection – CP-118', sub: 'R-402 · Zone 4 · 25 mins ago', severity: 'medium', dot: '#f59e0b' },
    { id: 3, title: 'Work Order WO-221 Overdue', sub: 'CP-205 · Zone-3 · 1 hour ago', severity: 'medium', dot: '#f59e0b' },
    { id: 4, title: 'Maintenance Due – VEH-0114', sub: 'Zone 2 · 2 hours ago', severity: 'low', dot: '#10b981' },
    { id: 5, title: 'High Priority Complaint #C-145', sub: 'CP-887 · Zone 1 · 3 hours ago', severity: 'high', dot: '#ef4444' },
  ];

  const destinations = [
    { code: 'DST-001', name: 'Gandhinagar Transfer Station', zone: 'Zone 4', cap: '200t/day', status: 'active', stat: '42.6t today' },
    { code: 'DST-002', name: 'North Zone Processing Site', zone: 'Zone 2', cap: '150t/day', status: 'active', stat: '28.4t today' },
    { code: 'DST-003', name: 'South Zone Disposal Facility', zone: 'Zone 3', cap: '300t/day', status: 'maintenance', stat: '15.4t today' },
  ];

  const statusCls: Record<string, string> = {
    ACTIVE: 'badge-active', COMPLETED: 'badge-completed',
    SCHEDULED: 'badge-scheduled', MAINTENANCE: 'badge-maintenance',
  };

  return (
    <div>
      {/* ── KPI Row ── */}
      <div className="kpi-grid">
        <KpiCard icon={<Route style={ic} />} iconBg="#2563eb" label="Total Routes" value={kpis.routes?.total ?? '–'} delta="+2" deltaType="up" />
        <KpiCard icon={<Activity style={ic} />} iconBg="#16a34a" label="Active Routes" value={kpis.operations?.activeCount ?? '–'} delta="60%" deltaType="neutral" />
        <KpiCard icon={<Truck style={ic} />} iconBg="#7c3aed" label="Total Vehicles" value={vehicles.total} />
        <KpiCard icon={<Truck style={ic} />} iconBg="#059669" label="Active Vehicles" value={vehicles.active} sub={`of ${vehicles.total}`} delta="64%" deltaType="up" />
        <KpiCard icon={<Wrench style={ic} />} iconBg="#dc2626" label="Breakdown" value={vehicles.breakdown} />
        <KpiCard icon={<Wrench style={ic} />} iconBg="#d97706" label="Maintenance" value={vehicles.maintenance} />
        <KpiCard icon={<AlertCircle style={ic} />} iconBg="#dc2626" label="Open Complaints" value={kpis.complaints?.open ?? '–'} delta="+3" deltaType="down" />
        <KpiCard icon={<ClipboardList style={ic} />} iconBg="#2563eb" label="Open Work Orders" value={kpis.workOrders?.open ?? '–'} />
      </div>

      {/* ── Map + Right Column ── */}
      <div className="dashboard-grid">
        <div className="panel" style={{ minHeight: 380 }}>
          <div className="panel-header">
            <span className="panel-title">Live Operations Map</span>
            <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 600, background: 'var(--ok-tint)', padding: '2px 8px', borderRadius: 5 }}>● Live</span>
          </div>
          <div style={{ height: 340 }}>
            <Map center={[23.2156, 72.6369]} points={liveMapPoints} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Alerts */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Active Alerts</span>
              <Link to="/dashboard/complaints" className="panel-link">View All</Link>
            </div>
            <div className="alert-list">
              {alerts.map(a => (
                <div key={a.id} className="alert-item">
                  <div className="alert-icon" style={{ background: a.dot }} />
                  <div className="alert-content">
                    <div className="alert-title">{a.title}</div>
                    <div className="alert-sub">{a.sub}</div>
                  </div>
                  <span className={`alert-badge badge-${a.severity}`}>
                    {a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="dashboard-bottom">
        {/* Active Routes table */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Active Routes</span>
            <Link to="/dashboard/routes" className="panel-link">View All →</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route ID</th><th>Zone</th><th>Vehicle</th><th>Driver</th><th>Progress</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.slice(0, 6).map((r: any, i: number) => {
                  const progress = [78, 65, 42, 100, 35, 0][i] ?? Math.round(Math.random() * 100);
                  const status = r.status || 'SCHEDULED';
                  return (
                    <tr key={r._id}>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand)' }}>{r.code}</span></td>
                      <td style={{ color: 'var(--ink-3)' }}>{r.zoneId?.name || '–'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.vehicleId?.vehicleId || '–'}</td>
                      <td style={{ color: 'var(--ink-2)' }}>{r.driverId?.name || '–'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="progress-bar-bg" style={{ width: 60 }}>
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{progress}%</span>
                        </div>
                      </td>
                      <td><span className={`status-badge ${statusCls[status] || 'badge-scheduled'}`}>{status}</span></td>
                    </tr>
                  );
                })}
                {routes.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 20 }}>No routes found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status donut */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Vehicle Status</span>
            <Link to="/dashboard/vehicles" className="panel-link">View All →</Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 14px 6px' }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              {(() => {
                const total = vehicles.total || 1;
                const segs = [
                  { val: vehicles.active, color: '#16a34a' },
                  { val: vehicleAvailable, color: '#60a5fa' },
                  { val: vehicles.maintenance, color: '#f59e0b' },
                  { val: vehicles.breakdown, color: '#ef4444' },
                ];
                let offset = -90;
                const cx = 55, cy = 55, r = 40, sw = 18, circ = 2 * Math.PI * r;
                return segs.map((s, i) => {
                  const pct = s.val / total;
                  const dash = pct * circ;
                  const el = (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                      stroke={s.color} strokeWidth={sw}
                      strokeDasharray={`${dash} ${circ - dash}`}
                      strokeDashoffset={(-offset / 360) * circ}
                      transform={`rotate(${offset} ${cx} ${cy})`}
                    />
                  );
                  offset += pct * 360;
                  return el;
                });
              })()}
              <text x="55" y="51" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--ink)">{vehicles.total}</text>
              <text x="55" y="64" textAnchor="middle" fontSize="9" fill="var(--ink-3)">Total</text>
            </svg>
          </div>
          <div className="donut-legend">
            {[
              { label: 'Active', val: vehicles.active, pct: Math.round((vehicles.active/(vehicles.total||1))*100), color: '#16a34a' },
              { label: 'Available', val: vehicleAvailable, pct: Math.round((vehicleAvailable/(vehicles.total||1))*100), color: '#60a5fa' },
              { label: 'Maintenance', val: vehicles.maintenance, pct: Math.round((vehicles.maintenance/(vehicles.total||1))*100), color: '#f59e0b' },
              { label: 'Breakdown', val: vehicles.breakdown, pct: Math.round((vehicles.breakdown/(vehicles.total||1))*100), color: '#ef4444' },
            ].map(l => (
              <div key={l.label} className="donut-legend-item">
                <div className="donut-legend-left">
                  <div className="donut-legend-dot" style={{ background: l.color }} />
                  {l.label}
                </div>
                <span className="donut-legend-val">{l.val} <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 10 }}>({l.pct}%)</span></span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

