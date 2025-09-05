import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// Page imports
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/dashboard';
import LoadoutBuilderOptimizer from './pages/loadout-builder-optimizer';
import WeaponArmorDatabase from './pages/weapon-armor-database';
import CollectionsTriumphs from './pages/collections-triumphs';
import AuthenticationAuthorization from './pages/authentication-authorization';
import CharacterManagement from './pages/character-management';
import NotFound from './pages/NotFound';
import BungieCallback from './pages/authentication-authorization/BungieCallback';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Landing page - shown to unauthenticated users */}
            <Route path="/" element={<LandingPage />} />
            
            {/* OAuth callback - accessible without authentication */}
            <Route path="/auth/bungie/callback" element={<BungieCallback />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/loadout-builder-optimizer" element={
              <ProtectedRoute>
                <LoadoutBuilderOptimizer />
              </ProtectedRoute>
            } />
            <Route path="/weapon-armor-database" element={
              <ProtectedRoute>
                <WeaponArmorDatabase />
              </ProtectedRoute>
            } />
            <Route path="/collections-triumphs" element={
              <ProtectedRoute>
                <CollectionsTriumphs />
              </ProtectedRoute>
            } />
            <Route path="/authentication-authorization" element={
              <ProtectedRoute>
                <AuthenticationAuthorization />
              </ProtectedRoute>
            } />
            <Route path="/character-management" element={
              <ProtectedRoute>
                <CharacterManagement />
              </ProtectedRoute>
            } />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;