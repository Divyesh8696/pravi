import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Map, Route, MapPin, Activity,
  Truck, Wrench, Users, CalendarClock, Building2,
  MessageSquareWarning, ClipboardList, Search as SearchIcon,
  ArrowLeftRight, BarChart2, FileText, ShieldCheck, UserCog,
  Bell, ChevronDown, LogOut, AlertTriangle, ChevronRight,
} from 'lucide-react';

interface NavItem { label: string; to: string; icon: React.ReactNode; end?: boolean; }
interface NavSection { group: string; items: NavItem[]; }

const adminNav: NavSection[] = [
  {
    group: '',
    items: [
      { label: 'Command Center', to: '/dashboard', icon: <LayoutDashboard size={15} />, end: true },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Routes', to: '/dashboard/routes', icon: <Route size={15} /> },
      { label: 'Fleet', to: '/dashboard/vehicles', icon: <Truck size={15} /> },
      { label: 'Infrastructure', to: '/dashboard/infrastructure', icon: <MapPin size={15} /> },
    ],
  },
  {
    group: 'Service',
    items: [
      { label: 'Complaints', to: '/dashboard/complaints', icon: <MessageSquareWarning size={15} /> },
      { label: 'Work Orders', to: '/dashboard/work-orders', icon: <ClipboardList size={15} /> },
    ],
  },
];


const citizenNav: NavSection[] = [
  {
    group: '',
    items: [
      { label: 'My Dashboard', to: '/dashboard', icon: <LayoutDashboard size={15} />, end: true },
    ],
  },
  {
    group: 'Services',
    items: [
      { label: 'Report Issue', to: '/dashboard/report-issue', icon: <AlertTriangle size={15} /> },
      { label: 'My Complaints', to: '/dashboard/complaints', icon: <ClipboardList size={15} /> },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div>Loading...</div>;

  const navSections = user.role === 'CITIZEN' ? citizenNav : adminNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-name">CityClean</div>
            <div className="sidebar-logo-sub">Municipal SWM Operations</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section, si) => (
            <div key={si} className="nav-section">
              {section.group && (
                <div className="nav-section-label">{section.group}</div>
              )}
              {section.items.map((item, ii) => (
                <NavLink
                  key={ii}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-item${isActive ? ' nav-item-active' : ''}`
                  }
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                  <ChevronRight size={11} className="nav-item-arrow" />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-city">
            <div className="sidebar-footer-dot" />
            <div>
              <div className="sidebar-footer-name">City of Cleanville</div>
              <div className="sidebar-footer-ver">v1.0.0</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-zone">
            <MapPin size={13} />
            <span>All Zones</span>
            <ChevronDown size={13} />
          </div>

          <div className="topbar-search">
            <SearchIcon size={13} className="topbar-search-icon" />
            <input
              className="topbar-search-input"
              placeholder="Search routes, vehicles, collection points, complaints..."
            />
          </div>

          <div className="topbar-actions">
            <button className="topbar-notif-btn">
              <Bell size={17} />
              <span className="topbar-notif-badge">12</span>
            </button>

            <div className="topbar-user">
              <div className="topbar-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="topbar-user-info">
                <div className="topbar-user-name">{user.name}</div>
                <div className="topbar-user-role">
                  {user.role === 'ADMIN' ? 'City Administrator' : user.role.replace('_', ' ')}
                </div>
              </div>
              <button
                className="topbar-logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

