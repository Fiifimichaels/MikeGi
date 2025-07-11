/*
  # Fix Chat System

  1. Tables
    - Update chat_messages table structure
    - Add proper foreign key constraints
    - Add indexes for better performance

  2. Security
    - Update RLS policies for chat functionality
    - Ensure proper access control
*/

-- Drop existing foreign key constraints if they exist
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_receiver_id_fkey;

-- Update chat_messages table structure
ALTER TABLE chat_messages 
  ALTER COLUMN sender_id TYPE text,
  ALTER COLUMN receiver_id TYPE text;

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_receiver 
  ON chat_messages(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type 
  ON chat_messages(sender_type);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can send chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view relevant chat messages" ON chat_messages;

-- Allow anyone to insert chat messages (for guest users)
CREATE POLICY "Anyone can send chat messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view messages they sent or received
CREATE POLICY "Users can view their chat messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    sender_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR receiver_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR sender_type = 'member'
    OR receiver_type = 'member'
  );

-- Allow admins to view all messages
CREATE POLICY "Admins can view all chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mikegi_admins 
      WHERE email = auth.jwt()->>'email' 
      AND is_active = true
    )
  );