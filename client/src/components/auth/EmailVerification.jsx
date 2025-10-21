import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await apiClient.get(`/auth/verify-email/${token}`);
        const data = response.data;

        if (data.success) {
          setStatus('success');
          
          // Store the authentication token and user data
          const { token: authToken, user } = data.data;
          
          // Set different messages based on user role
          if (user.role === 'provider') {
            setMessage('Email verified successfully! Your account is now pending admin approval. You will be notified once approved.');
          } else {
            setMessage('Email verified successfully!');
          }
          
          // Update the auth context with both token and user
          setAuthData(authToken, user);
          
          // Redirect to dashboard after 3 seconds for providers (to read the message)
          setTimeout(() => {
            navigate('/dashboard');
          }, user.role === 'provider' ? 3000 : 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.error || 'An error occurred during verification');
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <Loader className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  Verifying Your Email
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  Email Verified!
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  {message}
                </p>
                <p className="mt-2 text-sm text-primary-600">
                  Redirecting to dashboard...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  Verification Failed
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  {message}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-500 hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;