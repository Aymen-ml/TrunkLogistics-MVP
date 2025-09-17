import * as emailValidator from 'email-validator';

export const validateEmail = async (email) => {
  // First check basic email format
  if (!emailValidator.validate(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  try {
    // Check for disposable email domains
    const response = await fetch(`https://open.kickbox.com/v1/disposable/${email.split('@')[1]}`);
    const data = await response.json();
    
    if (data.disposable) {
      return {
        isValid: false,
        error: 'Please use a non-disposable email address'
      };
    }

    // Additional checks for common patterns that might indicate fake emails
    const emailParts = email.split('@');
    const localPart = emailParts[0];
    const domain = emailParts[1];

    // Check for suspicious patterns in local part
    if (localPart.length < 2 || /^[0-9]+$/.test(localPart)) {
      return {
        isValid: false,
        error: 'Invalid email address'
      };
    }

    // Check for common fake domains
    const suspiciousDomains = [
      'tempmail.com', 'throwaway.com', 'mailinator.com',
      'tempinbox.com', 'fake-mail.com', 'fakeinbox.com'
    ];
    
    if (suspiciousDomains.includes(domain.toLowerCase())) {
      return {
        isValid: false,
        error: 'Please use a valid email address'
      };
    }

    return {
      isValid: true
    };
  } catch (error) {
    console.error('Email validation error:', error);
    // If the validation service fails, we'll just validate the format
    return {
      isValid: emailValidator.validate(email)
    };
  }
};