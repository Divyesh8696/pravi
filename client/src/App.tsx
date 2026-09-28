import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/RoutesPage';
import RouteDetailsPage from './pages/RouteDetailsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import VehiclesPage from './pages/VehiclesPage';
import ComplaintsPage from './pages/ComplaintsPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import ReportIssuePage from './pages/ReportIssuePage';
import InfrastructurePage from './pages/InfrastructurePage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="routes/:id" element={<RouteDetailsPage />} />
            <Route path="work-orders" element={<WorkOrdersPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
            <Route path="infrastructure" element={<InfrastructurePage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="report-issue" element={<ReportIssuePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
