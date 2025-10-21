import React, { useEffect, useState } from 'react';
import { Sun, Moon, Save, Bell, BellOff, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const Settings = () => {
  const { showSuccess, showError } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('notificationsEnabled');
    return stored ? JSON.parse(stored) : true;
  });
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Apply theme immediately when changed
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Track unsaved changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    const savedNotificationsValue = savedNotifications ? JSON.parse(savedNotifications) : true;
    
    const hasChanges = theme !== savedTheme || notifications !== savedNotificationsValue;
    setHasUnsavedChanges(hasChanges);
  }, [theme, notifications]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Persist preferences to localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('notificationsEnabled', JSON.stringify(notifications));
      
      // Ensure theme is applied immediately
      document.documentElement.classList.toggle('dark', theme === 'dark');
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showSuccess('Settings saved successfully!');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Apply immediately for instant feedback
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Customize your application experience</p>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                {theme === 'dark' ? <Moon className="h-5 w-5 mr-2 text-blue-600" /> : <Sun className="h-5 w-5 mr-2 text-yellow-500" />}
                Theme
              </h2>
              <p className="text-sm text-gray-500 mt-1">Choose your preferred color scheme</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow'
                  }`}
                >
                  <Sun className={`h-8 w-8 mb-2 ${theme === 'light' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Light Mode
                  </span>
                  {theme === 'light' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow'
                  }`}
                >
                  <Moon className={`h-8 w-8 mb-2 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Dark Mode
                  </span>
                  {theme === 'dark' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Theme changes are applied immediately and saved to your browser
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                {notifications ? <Bell className="h-5 w-5 mr-2 text-blue-600" /> : <BellOff className="h-5 w-5 mr-2 text-gray-400" />}
                Notifications
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage your notification preferences</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  {notifications ? (
                    <Bell className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  )}
                  <div>
                    <label htmlFor="notifications-toggle" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Enable Notifications
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Receive updates about bookings, messages, and important events
                    </p>
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  <button
                    type="button"
                    id="notifications-toggle"
                    role="switch"
                    aria-checked={notifications}
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      notifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {!notifications && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <BellOff className="h-4 w-4 mr-2" />
                    Notifications are currently disabled. You won't receive real-time updates.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between bg-white shadow rounded-lg p-6">
            <div>
              {hasUnsavedChanges && (
                <p className="text-sm text-amber-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  You have unsaved changes
                </p>
              )}
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving || !hasUnsavedChanges}
              className={`inline-flex items-center px-6 py-2.5 rounded-md text-white font-medium transition-colors ${
                saving || !hasUnsavedChanges
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Your preferences are saved locally in your browser and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

