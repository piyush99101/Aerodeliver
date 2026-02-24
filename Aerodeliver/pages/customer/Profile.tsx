import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../services/AuthContext';

// Force Next.js to skip pre-rendering this page during build
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    promo: false
  });

  // Safe initialization
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Drone Lane, Tech City, CA 94043'
  });

  // Sync state if user loads after initial render
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [passwords, setPasswords] = useState({ oldPwd: '', newPwd: '', confirmPwd: '' });

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Name is required.';
    const digits = formData.phone.replace(/[^0-9]/g, '');
    if (digits.length < 7) e.phone = 'Enter a valid phone number.';
    return e;
  };

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(url);
  };

  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const eobj = validateProfile();
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) return;

    setSaving(true);
    setSuccessMessage('');
    try {
      if (user) {
        const success = await updateProfile({ name: formData.name });
        if (success) {
          setSuccessMessage('Profile updated successfully');
          setTimeout(() => setSuccessMessage(''), 3000);
          setIsEditing(false);
        } else {
          setErrors({ form: 'Failed to update profile. Please try again.' });
        }
      }
      setSaving(false);
    } catch (err) {
      setSaving(false);
      setErrors({ form: 'Failed to save. Try again.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.newPwd || passwords.newPwd !== passwords.confirmPwd) {
      setErrors({ password: 'New passwords must match.' });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setShowPasswordModal(false);
    setPasswords({ oldPwd: '', newPwd: '', confirmPwd: '' });
    setSuccessMessage('Password changed');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass-card p-8 rounded-2xl text-center sticky top-24">
              <div className="relative inline-block mb-6">
                <img
                  src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-brand-gray-100 object-cover shadow-md"
                />
                <button type="button" onClick={handlePickAvatar} className="absolute bottom-0 right-0 bg-brand-blue text-white w-9 h-9 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-600 transition">
                  <i className="fas fa-camera text-xs"></i>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) handleAvatarChange(f); }} />
              </div>

              <h2 className="text-xl font-bold text-brand-dark">{user?.name || 'Loading...'}</h2>
              <div className="inline-block px-3 py-1 bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-wider rounded-full mt-2 mb-6">
                {user?.role || 'User'}
              </div>

              <div className="flex justify-center gap-2 mb-8">
                <div className="text-center px-4 border-r border-gray-200">
                  <div className="text-lg font-bold text-brand-dark">12</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-lg font-bold text-brand-dark">4.9</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>

              <button onClick={() => setShowSignoutModal(true)} className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition secondary-btn">
                Sign Out
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card overflow-hidden rounded-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-brand-dark text-lg">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-sm font-semibold ${isEditing ? 'text-red-500' : 'text-brand-blue'}`}
                >
                  {isEditing ? 'Cancel' : 'Edit Details'}
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none disabled:bg-gray-50 disabled:text-gray-500 ${errors.name ? 'border-rose-500' : 'border-gray-300'}`}
                      />
                      {errors.name && <div className="text-rose-600 text-sm mt-1">{errors.name}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        disabled={true}
                        value={formData.email}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Pickup Address</label>
                    <textarea
                      rows={2}
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={saving} className="bg-brand-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition primary-btn">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                  {successMessage && <div className="text-emerald-600 text-sm mt-2">{successMessage}</div>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain the same... */}
      {showSignoutModal && (
        <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center" onClick={() => setShowSignoutModal(false)}>
          <div className="modal-panel glass-card p-6 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Confirm Sign Out</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSignoutModal(false)} className="secondary-btn">Cancel</button>
              <button onClick={() => { setShowSignoutModal(false); }} className="primary-btn">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
