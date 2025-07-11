@@ .. @@
 -- Create policy for admins to view all chat messages
 CREATE POLICY "Admins can view all chat messages"
   ON chat_messages
   FOR SELECT
   TO authenticated
-  USING (EXISTS ( SELECT 1
-     FROM mikegi_admins
-    WHERE ((mikegi_admins.email = (jwt() ->> 'email'::text)) AND (mikegi_admins.is_active = true))));
+  USING (EXISTS ( SELECT 1
+     FROM mikegi_admins
+    WHERE ((mikegi_admins.email = (auth.jwt() ->> 'email'::text)) AND (mikegi_admins.is_active = true))));

 -- Create policy for users to view their chat messages
 CREATE POLICY "Users can view their chat messages"
   ON chat_messages
   FOR SELECT
   TO public
-  USING (((sender_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)) OR (receiver_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)) OR (sender_type = 'member'::text) OR (receiver_type = 'member'::text)));
+  USING (((sender_id = auth.uid()::text) OR (receiver_id = auth.uid()::text) OR (sender_type = 'member'::text) OR (receiver_type = 'member'::text)));

 -- Vendor Tables
 
@@ .. @@
 -- Vendor access policies
 CREATE POLICY "Vendors can read own profile"
   ON mikegi_vendors
   FOR SELECT
   TO authenticated
-  USING (id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);
+  USING (id = auth.uid());

 CREATE POLICY "Vendors can update own profile"
   ON mikegi_vendors
   FOR UPDATE
   TO authenticated
-  USING (id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);
+  USING (id = auth.uid());

 -- Vendor shops policies
 CREATE POLICY "Vendors can manage own shops"
   ON mikegi_vendor_shops
   FOR ALL
   TO authenticated
-  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);
+  USING (vendor_id = auth.uid());

 CREATE POLICY "Anyone can view active shops"
   ON mikegi_vendor_shops
@@ .. @@
 -- Vendor subscriptions policies
 CREATE POLICY "Vendors can view own subscriptions"
   ON mikegi_vendor_subscriptions
   FOR SELECT
   TO authenticated
-  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);
+  USING (vendor_id = auth.uid());

 CREATE POLICY "System can manage subscriptions"
   ON mikegi_vendor_subscriptions
@@ .. @@
 -- Vendor notifications policies
 CREATE POLICY "Vendors can view own notifications"
   ON mikegi_vendor_notifications
   FOR SELECT
   TO authenticated
-  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);
+  USING (vendor_id = auth.uid());

 CREATE POLICY "System can create notifications"
   ON mikegi_vendor_notifications
@@ .. @@
 -- Vendor payments policies
 CREATE POLICY "Vendors can view own payments"
   ON mikegi_vendor_payments
   FOR SELECT
   TO authenticated
-  USING (vendor_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)::uuid);
+  USING (vendor_id = auth.uid());

 CREATE POLICY "System can manage payments"
   ON mikegi_vendor_payments