import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implementar lógica de logout aqui
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-blue-600 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Bola de Neve</h1>
        </div>
        <nav className="mt-6">
          <Link
            to="/"
            className="block px-6 py-3 text-gray-200 hover:bg-blue-700 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/funds"
            className="block px-6 py-3 text-gray-200 hover:bg-blue-700 hover:text-white"
          >
            Fundos
          </Link>
          <Link
            to="/users"
            className="block px-6 py-3 text-gray-200 hover:bg-blue-700 hover:text-white"
          >
            Usuários
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-8 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
