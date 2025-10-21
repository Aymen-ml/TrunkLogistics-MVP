import React, { useEffect } from 'react';
import SignupForm from './SignupForm';

const Register = () => {
  useEffect(() => {
    console.log('Register component mounted');
    console.log('SignupForm component:', SignupForm);
  }, []);
  
  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Register:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Registration Error</h1>
          <p className="text-gray-600 mb-4">Error: {error.message}</p>
          <a href="/" className="text-blue-600 hover:underline">Go Home</a>
        </div>
      </div>
    );
  }
};

export default Register;
