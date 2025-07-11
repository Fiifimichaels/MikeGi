export interface Vendor {
  id: string;
  email: string;
  phone: string;
  business_name: string;
  owner_name: string;
  business_address: string;
  city: string;
  region: string;
  mobile_money_number: string;
  mobile_money_network: 'mtn' | 'vodafone' | 'airteltigo';
  business_license?: string;
  is_verified: boolean;
  is_active: boolean;
  subscription_status: 'pending' | 'active' | 'expired' | 'suspended';
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorShop {
  id: string;
  vendor_id: string;
  shop_type: 'food' | 'car' | 'house';
  shop_name: string;
  shop_description?: string;
  shop_address: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
}

export interface VendorSubscription {
  id: string;
  vendor_id: string;
  amount: number;
  payment_method: string;
  payment_reference?: string;
  status: 'pending' | 'paid' | 'failed';
  subscription_period: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface VendorNotification {
  id: string;
  vendor_id: string;
  title: string;
  message: string;
  type: 'info' | 'order' | 'payment' | 'warning' | 'success';
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface VendorPayment {
  id: string;
  vendor_id: string;
  order_id?: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  mobile_money_number: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_reference?: string;
  processed_at?: string;
  created_at: string;
}

export interface VendorRegistrationData {
  email: string;
  phone: string;
  password: string;
  business_name: string;
  owner_name: string;
  business_address: string;
  city: string;
  region: string;
  mobile_money_number: string;
  mobile_money_network: 'mtn' | 'vodafone' | 'airteltigo';
  business_license?: string;
  shops: {
    shop_type: 'food' | 'car' | 'house';
    shop_name: string;
    shop_description?: string;
    shop_address: string;
  }[];
}