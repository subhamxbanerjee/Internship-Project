import { useEffect, useState } from 'react';
import {
  PortalUser,
  createUser,
  deleteUser,
  fetchUsers,
  formatRole,
  getApiErrorMessage,
  resetUserPassword,
  updateUser,
} from '../services/api';

const emptyForm = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  role: 'EMPLOYEE',
};

function UsersPage() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [error, setError] = useState('');

  const loadUsers = () => {
    setLoading(true);
    fetchUsers()
      .then(setUsers)
      .catch(() => {
        setError('Could not load users. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await createUser(form);
      setForm(emptyForm);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create user.'));
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;
    setError('');
    try {
      await updateUser(editingUser.id, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.role,
        active: editingUser.active,
      });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update user.'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete user.'));
    }
  };

  const handleResetPassword = async (id: number) => {
    const password = window.prompt('Enter new password:');
    if (!password) return;
    setError('');
    try {
      await resetUserPassword(id, password);
      window.alert('Password reset successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password.'));
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading users...</div>;
  }

  const activeCount = users.filter((u) => u.active).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
            <p className="mt-2 text-sm text-slate-500">Manage portal access and roles for internal personnel.</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingUser(null); }}
            className="rounded-full bg-blue-600 px-5 py-3 text-white"
          >
            Add New User
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Add New User</h2>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3">
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-white">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-3">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingUser && (
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Edit User: {editingUser.username}</h2>
          <form onSubmit={handleUpdate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input value={editingUser.fullName} onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3">
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={editingUser.active} onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-white">Save</button>
              <button type="button" onClick={() => setEditingUser(null)} className="rounded-xl border border-slate-200 px-5 py-3">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Total Users</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{users.length}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Active</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{activeCount}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Admins</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{adminCount}</div>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.fullName}</div>
                    <div className="text-slate-500">{user.username} · {user.email}</div>
                  </td>
                  <td className="px-6 py-4">{formatRole(user.role)}</td>
                  <td className={`px-6 py-4 ${user.active ? 'text-emerald-600' : 'text-red-600'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setEditingUser(user)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs">Edit</button>
                      <button onClick={() => handleResetPassword(user.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs">Reset Password</button>
                      <button onClick={() => handleDelete(user.id)} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
