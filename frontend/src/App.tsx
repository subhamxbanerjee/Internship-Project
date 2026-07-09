import { Route, Routes, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import UploadPage from './pages/UploadPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import ViewIncidentsPage from './pages/ViewIncidentsPage';
import ReportIncidentPage from './pages/ReportIncidentPage';
import LoginPage from './pages/LoginPage';
import Layout from './layouts/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-medium text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-medium text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return <Navigate to="/incidents" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route
  path="/login"
  element={
    loading ? (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    ) : isAuthenticated ? (
      <Navigate to="/" replace />
    ) : (
      <LoginPage />
    )
  }
/>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
        <Route path="upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="incidents" element={<ProtectedRoute><ViewIncidentsPage /></ProtectedRoute>} />
        <Route path="incidents/report" element={<AdminRoute><ReportIncidentPage /></AdminRoute>} />
        <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
