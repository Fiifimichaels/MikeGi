import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Vendor, VendorRegistrationData } from '../types/vendor';

interface VendorAuthContextType {
  vendor: Vendor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: VendorRegistrationData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<boolean>;
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (context === undefined) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
};

export const VendorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing vendor session
    const vendorData = localStorage.getItem('mikegi_vendor');
    if (vendorData) {
      try {
        const parsedVendor = JSON.parse(vendorData);
        setVendor(parsedVendor);
      } catch (error) {
        localStorage.removeItem('mikegi_vendor');
      }
    }
    setLoading(false);
  }, []);

  const register = async (data: VendorRegistrationData): Promise<{ success: boolean; message?: string }> => {
    try {
      // Call vendor registration edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vendor-register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, message: 'Registration successful! Please pay your monthly subscription to activate your account.' };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Vendor registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Call vendor login edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vendor-login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success && result.vendor) {
        setVendor(result.vendor);
        localStorage.setItem('mikegi_vendor', JSON.stringify(result.vendor));
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Vendor login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setVendor(null);
      localStorage.removeItem('mikegi_vendor');
    } catch (error) {
      console.error('Vendor logout error:', error);
    }
  };

  const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!vendor) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-vendor-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendor_id: vendor.id })
      });

      const result = await response.json();
      return result.is_active || false;
    } catch (error) {
      console.error('Subscription check error:', error);
      return false;
    }
  };

  return (
    <VendorAuthContext.Provider value={{ 
      vendor, 
      loading, 
      login, 
      register, 
      logout, 
      checkSubscriptionStatus 
    }}>
      {children}
    </VendorAuthContext.Provider>
  );
};