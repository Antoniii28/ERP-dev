import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './screens/DashboardPage';
import { CoreOperationsPage } from './screens/CoreOperationsPage';
import { CommercialPage } from './screens/CommercialPage';
import { LoginPage } from './screens/LoginPage';
import { ReportsPage } from './screens/ReportsPage';
import { CrmPage } from './screens/CrmPage';
import { InsightsPage } from './screens/InsightsPage';
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
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
