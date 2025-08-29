import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Page imports
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
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loadout-builder-optimizer" element={<LoadoutBuilderOptimizer />} />
          <Route path="/weapon-armor-database" element={<WeaponArmorDatabase />} />
          <Route path="/collections-triumphs" element={<CollectionsTriumphs />} />
          <Route path="/authentication-authorization" element={<AuthenticationAuthorization />} />
          <Route path="/auth/bungie/callback" element={<BungieCallback />} />
          <Route path="/character-management" element={<CharacterManagement />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;