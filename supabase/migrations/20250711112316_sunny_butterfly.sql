/*
  # Add Foreign Key Constraint for Orders

  1. Foreign Key Constraint
    - Add foreign key constraint on `mikegi_orders.user_id` referencing `mikegi_users.id`
    - This enables proper Supabase joins between orders and users

  2. Security
    - Maintains existing RLS policies
    - No changes to existing data structure
*/

-- Add foreign key constraint to enable proper joins
ALTER TABLE mikegi_orders 
ADD CONSTRAINT mikegi_orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES mikegi_users(id) ON DELETE CASCADE;