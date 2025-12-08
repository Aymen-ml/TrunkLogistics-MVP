import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const EmailTest = () => {
  const { t } = useTranslation();
  usePageTitle('Email Test');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [configInfo, setConfigInfo] = useState(null);

  const checkConfig = async () => {
    try {
      const response = await fetch('https://trunklogistics-api.onrender.com/api/diagnostics/email');
      const data = await response.json();
      setConfigInfo(data.emailService);
    } catch (error) {
      console.error('Failed to check config:', error);
    }
  };

  const sendTestEmail = async () => {
    if (!email) {
      setResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://trunklogistics-api.onrender.com/api/diagnostics/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Mail className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Email Service Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test your SMTP configuration and send test emails
          </p>
        </div>

        {/* Configuration Status */}
        {configInfo && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Email Service Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Status:</span>
                <span className={`font-semibold ${
                  configInfo.status === 'configured' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {configInfo.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">SMTP Host:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {configInfo.configuration.EMAIL_HOST}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Port:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {configInfo.configuration.EMAIL_PORT}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">From Address:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {configInfo.configuration.EMAIL_FROM}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">User Configured:</span>
                <span className={`${
                  configInfo.configuration.hasEMAIL_USER 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {configInfo.configuration.hasEMAIL_USER ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Password Configured:</span>
                <span className={`${
                  configInfo.configuration.hasEMAIL_PASSWORD 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {configInfo.configuration.hasEMAIL_PASSWORD ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Test Email Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Send Test Email
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={loading}
              />
            </div>

            <button
              onClick={sendTestEmail}
              disabled={loading || !email}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-accent-500 hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Test Email
                </>
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${
                    result.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className={`mt-1 text-sm ${
                    result.success 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.message || result.error}
                  </p>
                  {result.details && (
                    <pre className="mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            📧 What to check:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Check your email inbox (the address you entered above)</li>
            <li>• Check your spam/junk folder</li>
            <li>• Check Gmail's Promotions or Social tabs</li>
            <li>• Check Elastic Email Reports for delivery status</li>
            <li>• New SMTP servers often have emails marked as spam initially</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;
