import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VendorLoginRequest {
  email: string
  password: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, password }: VendorLoginRequest = await req.json()

    // Find vendor by email
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !vendor) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // In production, use proper password hashing (bcrypt)
    // For demo purposes, using simple comparison
    if (vendor.password !== password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Remove password from response
    const { password: _, ...vendorData } = vendor

    // Check subscription status
    let subscriptionMessage = ''
    if (vendor.subscription_status !== 'active') {
      subscriptionMessage = 'Your subscription is not active. Please pay your monthly fee to continue using the platform.'
    }

    return new Response(
      JSON.stringify({
        success: true,
        vendor: vendorData,
        message: subscriptionMessage || 'Login successful'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Login failed. Please try again.',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})