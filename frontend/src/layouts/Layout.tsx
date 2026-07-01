import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-3 ${isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row">
        <aside className="w-full border-r border-slate-200 bg-white p-5 md:w-64">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">C</div>
              <div>
                <div className="font-semibold text-slate-900">CenturyPly</div>
                <div className="text-sm text-slate-500">Internal Portal</div>
              </div>
            </div>
            {user && (
              <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <div className="font-medium text-slate-900">{user.fullName}</div>
                <div className="text-slate-500">{user.role.replace(/_/g, ' ')}</div>
              </div>
            )}
          </div>
          <nav className="space-y-2">
            <NavLink className={navClass} to="/">Dashboard</NavLink>
            <NavLink className={navClass} to="/documents">Documents</NavLink>
            <NavLink className={navClass} to="/upload">Upload</NavLink>
            {role === 'SUPER_ADMIN' && <NavLink className={navClass} to="/users">Users</NavLink>}
            <NavLink className={navClass} to="/settings">Settings</NavLink>
          </nav>
          <button onClick={handleLogout} className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-white">
            Logout
          </button>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
