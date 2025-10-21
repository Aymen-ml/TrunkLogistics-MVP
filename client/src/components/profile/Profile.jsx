import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import { Save, User, Mail, Phone, Lock, MapPin, Building2 } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, refreshProfile } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [meta, setMeta] = useState({ email: '', role: '', emailVerified: false, isActive: true, createdAt: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiClient.get('/auth/profile');
        const u = resp.data.data?.user || user;
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });
        setMeta({
          email: u.email || '',
          role: u.role || '',
          emailVerified: !!u.emailVerified,
          isActive: u.isActive !== false,
          createdAt: u.createdAt || ''
        });
      } catch (e) {
        // Fallback to current auth user
        if (user) {
          setForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
          setMeta({
            email: user.email || '',
            role: user.role || '',
            emailVerified: !!user.emailVerified,
            isActive: true,
            createdAt: ''
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await apiClient.put('/auth/profile', form);
      const updated = response.data.data?.user;
      if (updated) {
        updateUser(updated);
      } else {
        await refreshProfile();
      }
      alert('Profile updated successfully');
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Update failed';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const updatePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      alert('Passwords do not match');
      return;
    }
    setPwdSaving(true);
    try {
      await apiClient.put('/auth/password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      alert('Password updated');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update password';
      alert(msg);
    } finally {
      setPwdSaving(false);
    }
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">View and update your account information.</p>
        </div>

        <div className="space-y-8">
          {/* Account Overview Section */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">Role</div>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {meta.role}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">Email Verified</div>
                <div className="mt-2 text-sm font-medium text-gray-800">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    meta.emailVerified ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {meta.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">Account Status</div>
                <div className="mt-2 text-sm font-medium text-gray-800">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    meta.isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {meta.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {meta.createdAt && (
                <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">Member Since</div>
                  <div className="mt-2 text-sm font-medium text-gray-800">{new Date(meta.createdAt).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 w-full">
                    {meta.email}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Email address cannot be changed from this form</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    </div>
                    <input 
                      id="firstName" 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    </div>
                    <input 
                      id="lastName" 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                  </div>
                  <input 
                    id="phone" 
                    name="phone" 
                    type="tel"
                    value={form.phone} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-accent-500 hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Location Information Section */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Location Information</h2>
            <LocationEditor />
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security</h2>
            <form onSubmit={updatePwd} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Enter current password" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
                      value={pwd.currentPassword} 
                      onChange={(e) => setPwd(p => ({ ...p, currentPassword: e.target.value }))} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Enter new password" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
                      value={pwd.newPassword} 
                      onChange={(e) => setPwd(p => ({ ...p, newPassword: e.target.value }))} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Confirm new password" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
                      value={pwd.confirm} 
                      onChange={(e) => setPwd(p => ({ ...p, confirm: e.target.value }))} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={pwdSaving} 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-accent-500 hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {pwdSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const LocationEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ companyName: '', address: '', city: '', country: '', postalCode: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiClient.get('/users/profile');
        const profile = resp.data.data?.profile;
        setRole(resp.data.data?.user?.role || '');
        setForm({
          companyName: profile?.company_name || profile?.companyName || '',
          address: profile?.address || '',
          city: profile?.city || '',
          country: profile?.country || '',
          postalCode: profile?.postal_code || profile?.postalCode || ''
        });
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/users/profile', form);
      alert('Location information saved');
    } catch (e2) {
      const msg = e2.response?.data?.error || e2.message || 'Failed to save location info';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {role === 'provider' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Company Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            </div>
            <input 
              name="companyName" 
              value={form.companyName} 
              onChange={handleChange} 
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
              placeholder="Enter company name"
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Street Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
          </div>
          <input 
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
            placeholder="Enter street address"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">City</label>
          <input 
            name="city" 
            value={form.city} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
            placeholder="Enter city"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Country</label>
          <input 
            name="country" 
            value={form.country} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
            placeholder="Enter country"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Postal Code</label>
        <input 
          name="postalCode" 
          value={form.postalCode} 
          onChange={handleChange} 
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200" 
          placeholder="Enter postal code"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-accent-500 hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Location
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default Profile;

