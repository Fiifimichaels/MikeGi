
  1. New Tables
    - `mikegi_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
    - `mikegi_services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image` (text)
      - `category` (text) - 'car', 'house', 'food'
      - `available` (boolean, default true)
      - `created_at` (timestamp)
    - `mikegi_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `service_id` (uuid, foreign key)
      - `service_name` (text)
      - `amount` (numeric)
      - `status` (text, default 'pending')
      - `payment_reference` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add admin policies for full access
</sql>

-- Create mikegi_users table
CREATE TABLE IF NOT EXISTS mikegi_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create mikegi_services table
CREATE TABLE IF NOT EXISTS mikegi_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  image text NOT NULL,
  category text NOT NULL CHECK (category IN ('car', 'house', 'food')),
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create mikegi_orders table
CREATE TABLE IF NOT EXISTS mikegi_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES mikegi_services(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_reference text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mikegi_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikegi_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikegi_orders ENABLE ROW LEVEL SECURITY;

-- Policies for mikegi_users
CREATE POLICY "Users can read own profile"
  ON mikegi_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON mikegi_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON mikegi_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policies for mikegi_services
CREATE POLICY "Anyone can read available services"
  ON mikegi_services
  FOR SELECT
  TO authenticated
  USING (available = true);

CREATE POLICY "Admins can manage all services"
  ON mikegi_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policies for mikegi_orders
CREATE POLICY "Users can read own orders"
  ON mikegi_orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON mikegi_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON mikegi_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert demo services
INSERT INTO mikegi_services (name, description, price, image, category) VALUES
-- Cars
('Toyota Camry 2023', 'Comfortable sedan perfect for city driving and long trips', 150.00, 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400', 'car'),
('Honda CR-V 2023', 'Spacious SUV ideal for family trips and adventures', 200.00, 'https://images.pexels.com/photos/35967/mini-cooper-auto-model-vehicle.jpg?auto=compress&cs=tinysrgb&w=400', 'car'),
('BMW X5 2023', 'Luxury SUV with premium features and comfort', 350.00, 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=400', 'car'),
-- Houses
('Modern Apartment', 'Fully furnished 2-bedroom apartment in the city center', 80.00, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 'house'),
('Luxury Villa', 'Beautiful 4-bedroom villa with pool and garden', 250.00, 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400', 'house'),
('Cozy Studio', 'Perfect studio apartment for solo travelers', 45.00, 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400', 'house'),
-- Food
('Jollof Rice Special', 'Traditional Ghanaian jollof rice with chicken and vegetables', 25.00, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', 'food'),
('Grilled Tilapia', 'Fresh grilled tilapia with banku and pepper sauce', 30.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400', 'food'),
('Kelewele Combo', 'Spicy fried plantain with groundnuts and fish', 15.00, 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400', 'food');