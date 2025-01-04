import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import Dashboard from './app/page';
import Funds from './app/funds/page';
import Users from './app/users/page';
import Login from './app/login/page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/funds',
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Funds />
        </DashboardLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      </PrivateRoute>
    ),
  },
]);
