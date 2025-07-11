import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface MikegiUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export interface MikegiService {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'car' | 'house' | 'food';
  available: boolean;
  created_at: string;
}

export interface MikegiOrder {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_reference?: string;
  created_at: string;
}