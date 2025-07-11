/*
  # Vendor System Implementation

  1. New Tables
    - `vendors` - Vendor registration and profile information
    - `vendor_shops` - Vendor shop types and configurations
    - `vendor_subscriptions` - Monthly subscription tracking
    - `vendor_notifications` - Notification system for vendors
    - `vendor_payments` - Payment tracking for vendors

  2. Security
    - Enable RLS on all vendor tables
    - Add policies for vendor access control
    - Add policies for admin management

  3. Features
    - Multi-shop vendor registration
    - Mobile money integration
    - Subscription management
    - Location-based services
    - Notification system
*/

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
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

-- Create vendor shops table
CREATE TABLE IF NOT EXISTS vendor_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  shop_type text NOT NULL CHECK (shop_type IN ('food', 'car', 'house')),
  shop_name text NOT NULL,
  shop_description text,
  shop_address text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create vendor subscriptions table
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL DEFAULT 50.00,
  payment_method text DEFAULT 'mobile_money',
  payment_reference text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  subscription_period text DEFAULT 'monthly',
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 month'),
  created_at timestamptz DEFAULT now()
);

-- Create vendor notifications table
CREATE TABLE IF NOT EXISTS vendor_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'order', 'payment', 'warning', 'success')),
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create vendor payments table
CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  order_id uuid REFERENCES mikegi_orders(id),
  amount decimal(10, 2) NOT NULL,
  commission_rate decimal(5, 2) DEFAULT 5.00,
  commission_amount decimal(10, 2) NOT NULL,
  net_amount decimal(10, 2) NOT NULL,
  mobile_money_number text NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_reference text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Update mikegi_services to link with vendors
ALTER TABLE mikegi_services 
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES vendor_shops(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors(phone);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_subscription_status ON vendors(subscription_status);
CREATE INDEX IF NOT EXISTS idx_vendor_shops_vendor_id ON vendor_shops(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_shops_type ON vendor_shops(shop_type);
CREATE INDEX IF NOT EXISTS idx_vendor_shops_location ON vendor_shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id ON vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_notifications_vendor_id ON vendor_notifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Vendors can view own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE
  TO authenticated
  USING (id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Anyone can register as vendor"
  ON vendors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage all vendors"
  ON vendors FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM mikegi_admins 
    WHERE email = (jwt() ->> 'email'::text) AND is_active = true
  ));

-- RLS Policies for vendor_shops
CREATE POLICY "Vendors can manage own shops"
  ON vendor_shops FOR ALL
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Anyone can view active shops"
  ON vendor_shops FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage all shops"
  ON vendor_shops FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM mikegi_admins 
    WHERE email = (jwt() ->> 'email'::text) AND is_active = true
  ));

-- RLS Policies for vendor_subscriptions
CREATE POLICY "Vendors can view own subscriptions"
  ON vendor_subscriptions FOR SELECT
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Vendors can create own subscriptions"
  ON vendor_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Admins can manage all subscriptions"
  ON vendor_subscriptions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM mikegi_admins 
    WHERE email = (jwt() ->> 'email'::text) AND is_active = true
  ));

-- RLS Policies for vendor_notifications
CREATE POLICY "Vendors can view own notifications"
  ON vendor_notifications FOR SELECT
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "Vendors can update own notifications"
  ON vendor_notifications FOR UPDATE
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "System can create notifications"
  ON vendor_notifications FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for vendor_payments
CREATE POLICY "Vendors can view own payments"
  ON vendor_payments FOR SELECT
  TO authenticated
  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);

CREATE POLICY "System can manage payments"
  ON vendor_payments FOR ALL
  TO public
  WITH CHECK (true);

-- Function to calculate vendor commission
CREATE OR REPLACE FUNCTION calculate_vendor_payment(
  order_amount decimal,
  commission_rate decimal DEFAULT 5.00
) RETURNS TABLE (
  commission_amount decimal,
  net_amount decimal
) AS $$
BEGIN
  commission_amount := (order_amount * commission_rate / 100);
  net_amount := order_amount - commission_amount;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to check vendor subscription status
CREATE OR REPLACE FUNCTION check_vendor_subscription(vendor_uuid uuid)
RETURNS boolean AS $$
DECLARE
  is_active boolean := false;
BEGIN
  SELECT 
    (subscription_status = 'active' AND subscription_expires_at > now())
  INTO is_active
  FROM vendors 
  WHERE id = vendor_uuid;
  
  RETURN COALESCE(is_active, false);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vendor subscription status
CREATE OR REPLACE FUNCTION update_vendor_subscription_status()
RETURNS trigger AS $$
BEGIN
  -- Update vendor subscription status when payment is made
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE vendors 
    SET 
      subscription_status = 'active',
      subscription_expires_at = NEW.expires_at,
      is_active = true,
      updated_at = now()
    WHERE id = NEW.vendor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vendor_subscription
  AFTER UPDATE ON vendor_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_subscription_status();