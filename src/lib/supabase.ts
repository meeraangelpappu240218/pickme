import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper for admin users
export const signInAdmin = async (email: string, password: string) => {
  // First, check if user exists in admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  if (adminError || !adminUser) {
    throw new Error('Invalid admin credentials');
  }

  // For demo purposes, we'll use a simple password check
  // In production, you should use proper password hashing
  const validPasswords = {
    'admin@pickme.intel': 'admin123',
    'moderator@pickme.intel': 'mod123'
  };

  if (validPasswords[email as keyof typeof validPasswords] !== password) {
    throw new Error('Invalid password');
  }

  // Create a session by signing in with Supabase Auth
  // We'll use the email as both email and password for Supabase Auth
  // This is a workaround since we're using custom admin authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: email // Using email as password for Supabase Auth
  });

  if (error) {
    // If user doesn't exist in Supabase Auth, create them
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: email,
      options: {
        data: {
          role: adminUser.role,
          name: adminUser.name
        }
      }
    });

    if (signUpError) {
      throw new Error('Authentication failed');
    }

    return { user: signUpData.user, adminUser };
  }

  return { user: data.user, adminUser };
};

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error('Sign out failed');
  }
};
// Database types
export interface Officer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  telegram_id?: string;
  status: 'Active' | 'Suspended';
  department?: string;
  rank?: string;
  badge_number?: string;
  station?: string;
  credits_remaining: number;
  total_credits: number;
  total_queries: number;
  last_active: string;
  registered_on: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  officer_id: string;
  officer_name: string;
  action: 'Renewal' | 'Deduction' | 'Top-up' | 'Refund';
  credits: number;
  payment_mode: string;
  remarks?: string;
  created_at: string;
}

export interface APIKey {
  id: string;
  name: string;
  provider: string;
  api_key: string;
  status: 'Active' | 'Inactive';
  usage_count: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface Query {
  id: string;
  officer_id: string;
  officer_name: string;
  type: 'OSINT' | 'PRO';
  category: string;
  input_data: string;
  source?: string;
  result_summary?: string;
  full_result?: any;
  credits_used: number;
  status: 'Processing' | 'Success' | 'Failed' | 'Pending';
  created_at: string;
}

export interface OfficerRegistration {
  id: string;
  name: string;
  email: string;
  mobile: string;
  station: string;
  department?: string;
  rank?: string;
  badge_number?: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface LiveRequest {
  id: string;
  officer_id: string;
  officer_name: string;
  type: 'OSINT' | 'PRO';
  query_text: string;
  status: 'Processing' | 'Success' | 'Failed';
  response_time_ms?: number;
  created_at: string;
  completed_at?: string;
}