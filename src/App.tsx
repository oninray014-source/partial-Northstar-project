import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoutePersistence } from './components/navigation/RoutePersistence';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { IndustriesPage } from './pages/IndustriesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { WorkspaceLayout } from './pages/workspace/WorkspaceLayout';
import { WorkspaceDashboard } from './pages/workspace/WorkspaceDashboard';
import { WorkspaceLeads } from './pages/workspace/WorkspaceLeads';
import { WorkspaceLeadDetail } from './pages/workspace/WorkspaceLeadDetail';
import { WorkspacePipeline } from './pages/workspace/WorkspacePipeline';
import { WorkspaceProperties } from './pages/workspace/WorkspaceProperties';
import { WorkspacePropertyDetail } from './pages/workspace/WorkspacePropertyDetail';
import { 
  WorkspaceTasks, 
  WorkspaceCalendar, 
  WorkspaceTeam, 
  WorkspaceActivity, 
  WorkspaceSettings 
} from './pages/workspace/WorkspaceModules';

export default function App() {
  return (
    <BrowserRouter>
      <RoutePersistence />
      <AuthProvider>
        <Routes>
          {/* 1. PUBLIC BUSINESS WEBSITE ROUTES */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="industries" element={<IndustriesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* 2. AUTHENTICATION ROUTE */}
          <Route path="/login" element={<LoginPage />} />

          {/* 3. PRIVATE NORTHSTAR WORKSPACE / CRM FOUNDATION (PROTECTED) */}
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/workspace/dashboard" replace />} />
            <Route path="dashboard" element={<WorkspaceDashboard />} />
            <Route path="leads" element={<WorkspaceLeads />} />
            <Route path="leads/:id" element={<WorkspaceLeadDetail />} />
            <Route path="pipeline" element={<WorkspacePipeline />} />
            <Route path="properties" element={<WorkspaceProperties />} />
            <Route path="properties/:id" element={<WorkspacePropertyDetail />} />
            <Route path="tasks" element={<WorkspaceTasks />} />
            <Route path="calendar" element={<WorkspaceCalendar />} />
            <Route path="team" element={<WorkspaceTeam />} />
            <Route path="activity" element={<WorkspaceActivity />} />
            <Route path="settings" element={<WorkspaceSettings />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}


