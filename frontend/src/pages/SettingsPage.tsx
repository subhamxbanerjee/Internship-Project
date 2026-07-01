import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/api';

function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setPasswordError('Could not update password. Check your current password.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Change password and view your profile information.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <button className="rounded-xl bg-blue-600 px-5 py-3 text-white">Save Password</button>
            {passwordMessage && <div className="text-sm text-emerald-600">{passwordMessage}</div>}
            {passwordError && <div className="text-sm text-red-600">{passwordError}</div>}
          </form>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm text-slate-500">Full Name</div>
              <div className="mt-1 font-medium text-slate-900">{user?.fullName}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Username</div>
              <div className="mt-1 font-medium text-slate-900">{user?.username}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Email</div>
              <div className="mt-1 font-medium text-slate-900">{user?.email || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Role</div>
              <div className="mt-1 font-medium text-slate-900">{user?.role.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
