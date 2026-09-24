import { Navigate, Route, Routes } from 'react-router-dom';

import { DashboardPage } from './screens/DashboardPage';
import { LoginPage } from './screens/LoginPage';
import { MainLayout } from './layouts/MainLayout';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
