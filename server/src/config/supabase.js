import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = 'https://drqkwioicbcihakxgsoe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to execute raw SQL queries via Supabase RPC
export const executeQuery = async (queryText, params = []) => {
  try {
    // For now, we'll use the REST API instead of raw SQL
    // This is a temporary workaround for the IPv6 connection issue
    console.log('Executing query via Supabase REST API:', queryText);
    
    // This is a placeholder - we'll need to convert SQL queries to Supabase REST API calls
    throw new Error('Query execution via REST API not yet implemented');
  } catch (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
};

export default supabase;
