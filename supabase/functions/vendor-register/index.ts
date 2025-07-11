import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VendorRegistrationRequest {
  email: string
  phone: string
  password: string
  business_name: string
  owner_name: string
  business_address: string
  city: string
  region: string
  mobile_money_number: string
  mobile_money_network: 'mtn' | 'vodafone' | 'airteltigo'
  business_license?: string
  shops: {
    shop_type: 'food' | 'car' | 'house'
    shop_name: string
    shop_description?: string
    shop_address: string
  }[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const registrationData: VendorRegistrationRequest = await req.json()

    // Check if email or phone already exists
    const { data: existingVendor, error: checkError } = await supabase
      .from('vendors')
      .select('id, email, phone')
      .or(`email.eq.${registrationData.email},phone.eq.${registrationData.phone}`)
      .single()

    if (existingVendor) {
      return new Response(
        JSON.stringify({
          success: false,
          message: existingVendor.email === registrationData.email 
            ? 'Email already registered' 
            : 'Phone number already registered'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create vendor account
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        email: registrationData.email,
        phone: registrationData.phone,
        password: registrationData.password, // In production, hash this password
        business_name: registrationData.business_name,
        owner_name: registrationData.owner_name,
        business_address: registrationData.business_address,
        city: registrationData.city,
        region: registrationData.region,
        mobile_money_number: registrationData.mobile_money_number,
        mobile_money_network: registrationData.mobile_money_network,
        business_license: registrationData.business_license,
        is_verified: false,
        is_active: false,
        subscription_status: 'pending'
      })
      .select()
      .single()

    if (vendorError) {
      console.error('Vendor creation error:', vendorError)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to create vendor account'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Create vendor shops
    const shopInserts = registrationData.shops.map(shop => ({
      vendor_id: vendor.id,
      shop_type: shop.shop_type,
      shop_name: shop.shop_name,
      shop_description: shop.shop_description,
      shop_address: shop.shop_address,
      is_active: true
    }))

    const { error: shopsError } = await supabase
      .from('vendor_shops')
      .insert(shopInserts)

    if (shopsError) {
      console.error('Shops creation error:', shopsError)
      // Rollback vendor creation
      await supabase.from('vendors').delete().eq('id', vendor.id)
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to create vendor shops'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Create initial subscription record
    const { error: subscriptionError } = await supabase
      .from('vendor_subscriptions')
      .insert({
        vendor_id: vendor.id,
        amount: 50.00,
        status: 'pending',
        subscription_period: 'monthly',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })

    if (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError)
    }

    // Send welcome notification
    await supabase
      .from('vendor_notifications')
      .insert({
        vendor_id: vendor.id,
        title: 'Welcome to MikeGi!',
        message: 'Your vendor account has been created successfully. Please pay your monthly subscription to activate your account.',
        type: 'info'
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Vendor registration successful! Please pay your monthly subscription to activate your account.',
        vendor_id: vendor.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Registration failed. Please try again.',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})