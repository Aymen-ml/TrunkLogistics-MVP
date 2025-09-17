import React, { useEffect, useState } from 'react';
import { Sun, Moon, Save, Bell } from 'lucide-react';

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('notificationsEnabled');
    return stored ? JSON.parse(stored) : true;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Customize your application experience.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Theme</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme('light')}
                className={`inline-flex items-center px-3 py-2 rounded-md border ${theme === 'light' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
              >
                <Sun className="h-4 w-4 mr-2" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`inline-flex items-center px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
              >
                <Moon className="h-4 w-4 mr-2" /> Dark
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Notifications</h2>
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
              <span className="ml-2 text-sm text-gray-700 flex items-center"><Bell className="h-4 w-4 mr-1 text-gray-400" /> Enable notifications</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setSaving(true);
                try {
                  // Persist preferences
                  localStorage.setItem('theme', theme);
                  localStorage.setItem('notificationsEnabled', JSON.stringify(notifications));
                  // Ensure applied immediately
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  alert('Settings saved');
                } catch (e) {
                  alert('Failed to save settings');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

