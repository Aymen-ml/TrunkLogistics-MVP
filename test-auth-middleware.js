#!/usr/bin/env node

import jwt from 'jsonwebtoken';
import { authenticate } from './server/src/middleware/auth.js';

async function testAuthMiddleware() {
  console.log('🔍 Testing Authentication Middleware...\n');
  
  try {
    // Create a valid JWT token for the admin user
    const adminUser = {
      id: 'ff7aa261-caaa-4adc-a28a-b25aefdad9bf',
      email: 'korichiaymen27@gmail.com',
      role: 'admin'
    };
    
    const token = jwt.sign(adminUser, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    console.log('1. Generated JWT token for admin user');
    
    // Create mock request with token
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log('   Response status:', code);
          console.log('   Response data:', JSON.stringify(data, null, 2));
        }
      })
    };
    
    let nextCalled = false;
    const mockNext = () => {
      nextCalled = true;
      console.log('✅ Authentication middleware called next()');
    };
    
    // Test authentication middleware
    console.log('2. Testing authentication middleware...');
    await authenticate(mockReq, mockRes, mockNext);
    
    if (nextCalled) {
      console.log('✅ Authentication middleware passed');
      console.log('   User set on request:', {
        id: mockReq.user?.id,
        email: mockReq.user?.email,
        role: mockReq.user?.role
      });
    } else {
      console.log('❌ Authentication middleware failed');
    }
    
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
    console.log('   Stack:', error.stack);
  }
}

testAuthMiddleware().catch(console.error);