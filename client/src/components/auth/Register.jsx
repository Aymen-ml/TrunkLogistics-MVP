import React, { useEffect } from 'react';
import SignupForm from './SignupForm';

const Register = () => {
  useEffect(() => {
    console.log('Register component mounted');
    console.log('SignupForm component:', SignupForm);
  }, []);
  
  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Register:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Registration Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Error: {error.message}</p>
          <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Go Home</a>
        </div>
      </div>
    );
  }
};

export default Register;
