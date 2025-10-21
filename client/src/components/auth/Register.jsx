import React from 'react';
import SignupForm from './SignupForm';

const Register = () => {
  console.log('Register component rendering');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
};

export default Register;
