// Re-export types from supabase lib for backward compatibility
export type { MikegiUser as User, MikegiService as Service, MikegiOrder as Order } from '../lib/supabase';

export interface AuthContextType {
  user: MikegiUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Import the actual types
import type { MikegiUser } from '../lib/supabase';