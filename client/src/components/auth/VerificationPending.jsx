import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';

const VerificationPending = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">Check Your Email</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              We've sent a verification link to your email address.
              Please click the link to verify your account.
            </p>
          </div>

          <div className="mt-8">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <RefreshCw className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      What happens next?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>Once verified, you can start using your account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-center">
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Didn't receive the email? Check your spam folder or
                </p>
                <button 
                  className="mt-2 font-medium text-accent-500 hover:text-accent-600 transition-colors"
                  onClick={() => {
                    // TODO: Implement resend verification email
                    alert('Verification email resent');
                  }}
                >
                  Click here to resend
                </button>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                >
                  Continue to Login
                  <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;