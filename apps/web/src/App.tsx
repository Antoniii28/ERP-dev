import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './screens/DashboardPage';
import { CoreOperationsPage } from './screens/CoreOperationsPage';
import { CommercialPage } from './screens/CommercialPage';
import { LoginPage } from './screens/LoginPage';
import { OrganizationsPage } from './screens/OrganizationsPage';
import { RolesPage } from './screens/RolesPage';
import { UsersPage } from './screens/UsersPage';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/operations" element={<CoreOperationsPage />} />
        <Route path="/commercial" element={<CommercialPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
