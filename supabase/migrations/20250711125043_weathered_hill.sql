/*
  # MikeGi Vendor System Database Schema

  1. New Tables
    - `mikegi_vendors` - Main vendor information and business details
    - `mikegi_vendor_shops` - Individual shops owned by vendors (food, car, house)
    - `mikegi_vendor_subscriptions` - Monthly subscription payments and tracking
    - `mikegi_vendor_notifications` - Notification system for vendors
    - `mikegi_vendor_payments` - Payment processing and commission tracking

  2. Security
    - Enable RLS on all vendor tables
    - Add policies for vendor data access and management
    - Ensure vendors can only access their own data

  3. Features
    - Multi-shop support (food, car, house rental)
    - Subscription management with monthly fees
    - Payment processing with commission tracking
    - Location-based services
    - Notification system
    - Mobile money integration
*/

-- Create mikegi_vendors table
CREATE TABLE IF NOT EXISTS mikegi_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  password text NOT NULL,
  business_name text NOT NULL,
  owner_name text NOT NULL,
  business_address text NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  mobile_money_number text NOT NULL,
  mobile_money_network text NOT NULL CHECK (mobile_money_network IN ('mtn', 'vodafone', 'airteltigo')),
  business_license text,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT false,
  subscription_status text DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired', 'suspended')),
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mikegi_vendor_shops table
CREATE TABLE IF NOT EXISTS mikegi_vendor_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES mikegi_vendors(id) ON DELETE CASCADE,
  shop_type text NOT NULL CHECK (shop_type IN ('food', 'car', 'house')),
  shop_name text NOT NULL,
  shop_description text,
  shop_address text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create mikegi_vendor_subscriptions table
CREATE TABLE IF NOT EXISTS mikegi_vendor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES mikegi_vendors(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL DEFAULT 50.00,
  payment_method text DEFAULT 'mobile_money',
  payment_reference text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  subscription_period text DEFAULT 'monthly',
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create mikegi_vendor_notifications table
CREATE TABLE IF NOT EXISTS mikegi_vendor_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES mikegi_vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'order', 'payment', 'warning', 'success')),
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create mikegi_vendor_payments table
CREATE TABLE IF NOT EXISTS mikegi_vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES mikegi_vendors(id) ON DELETE CASCADE,
  order_id uuid REFERENCES mikegi_orders(id) ON DELETE SET NULL,
  amount decimal(10, 2) NOT NULL,
  commission_rate decimal(5, 4) DEFAULT 0.05,
  commission_amount decimal(10, 2) NOT NULL,
  net_amount decimal(10, 2) NOT NULL,
  mobile_money_number text NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_reference text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mikegi_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikegi_vendor_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikegi_vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikegi_vendor_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikegi_vendor_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for mikegi_vendors
CREATE POLICY "Vendors can read own data"
  ON mikegi_vendors
  FOR SELECT
  TO authenticated
  USING (id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Vendors can update own data"
  ON mikegi_vendors
  FOR UPDATE
  TO authenticated
  USING (id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Admins can manage all vendors"
  ON mikegi_vendors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_admins 
      WHERE email = (jwt() ->> 'email'::text) 
      AND is_active = true
    )
  );

-- Create policies for mikegi_vendor_shops
CREATE POLICY "Vendors can manage own shops"
  ON mikegi_vendor_shops
  FOR ALL
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Public can read active shops"
  ON mikegi_vendor_shops
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage all shops"
  ON mikegi_vendor_shops
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_admins 
      WHERE email = (jwt() ->> 'email'::text) 
      AND is_active = true
    )
  );

-- Create policies for mikegi_vendor_subscriptions
CREATE POLICY "Vendors can read own subscriptions"
  ON mikegi_vendor_subscriptions
  FOR SELECT
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Admins can manage all subscriptions"
  ON mikegi_vendor_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_admins 
      WHERE email = (jwt() ->> 'email'::text) 
      AND is_active = true
    )
  );

-- Create policies for mikegi_vendor_notifications
CREATE POLICY "Vendors can manage own notifications"
  ON mikegi_vendor_notifications
  FOR ALL
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Admins can manage all notifications"
  ON mikegi_vendor_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_admins 
      WHERE email = (jwt() ->> 'email'::text) 
      AND is_active = true
    )
  );

-- Create policies for mikegi_vendor_payments
CREATE POLICY "Vendors can read own payments"
  ON mikegi_vendor_payments
  FOR SELECT
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Admins can manage all payments"
  ON mikegi_vendor_payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_admins 
      WHERE email = (jwt() ->> 'email'::text) 
      AND is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mikegi_vendors_email ON mikegi_vendors(email);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendors_phone ON mikegi_vendors(phone);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendors_subscription_status ON mikegi_vendors(subscription_status);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_shops_vendor_id ON mikegi_vendor_shops(vendor_id);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_shops_type ON mikegi_vendor_shops(shop_type);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_shops_location ON mikegi_vendor_shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_subscriptions_vendor_id ON mikegi_vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_subscriptions_status ON mikegi_vendor_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_notifications_vendor_id ON mikegi_vendor_notifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_notifications_read ON mikegi_vendor_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_payments_vendor_id ON mikegi_vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_mikegi_vendor_payments_status ON mikegi_vendor_payments(payment_status);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mikegi_vendors_updated_at 
    BEFORE UPDATE ON mikegi_vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();