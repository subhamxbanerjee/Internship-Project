import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-new.png';

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function getRoleBadgeClasses(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return { avatar: 'bg-red-600', badge: 'bg-red-100 text-red-700' };
    case 'ADMIN':
      return { avatar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' };
    default:
      return { avatar: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700' };
  }
}

function Layout() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-3 ${isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`;

  const roleStyles = user ? getRoleBadgeClasses(user.role) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row">
        <aside className="w-full border-r border-slate-200 bg-white p-5 md:w-64">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CenturyPly" className="h-8 w-auto max-w-[120px] object-contain" />
              <div>
                <div className="text-sm text-slate-500">Internal Portal</div>
              </div>
            </div>
            {user && roleStyles && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-sm">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${roleStyles.avatar}`}
                >
                  {getInitials(user.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">{user.fullName}</div>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleStyles.badge}`}
                  >
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
          <nav className="space-y-2">
            <NavLink className={navClass} to="/">Dashboard</NavLink>
            <NavLink className={navClass} to="/documents">Documents</NavLink>
            {role === 'ADMIN' || role === 'SUPER_ADMIN' ? (
              <NavLink className={navClass} to="/upload">Upload</NavLink>
            ) : null}
            <NavLink className={navClass} to="/incidents">View Incidents</NavLink>
            {role === 'ADMIN' || role === 'SUPER_ADMIN' ? (
              <NavLink className={navClass} to="/incidents/report">Report Incident</NavLink>
            ) : null}
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