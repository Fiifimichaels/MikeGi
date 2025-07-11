import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PaymentRequest {
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceName: string
  orderId: string
  paymentMethod: 'mobile-money' | 'card'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, customerName, customerEmail, customerPhone, serviceName, orderId, paymentMethod }: PaymentRequest = await req.json()

    // Hubtel Payment API credentials
    const HUBTEL_API_ID = Deno.env.get('HUBTEL_API_ID')!
    const HUBTEL_API_KEY = Deno.env.get('HUBTEL_API_KEY')!
    
    // Prepare payment data for Hubtel
    const paymentData = {
      amount: amount,
      currency: 'GHS',
      customerName: customerName,
      customerEmail: customerEmail,
      customerMsisdn: customerPhone,
      channel: paymentMethod === 'mobile-money' ? 'mobile-money' : 'card',
      primaryCallbackUrl: `${req.headers.get('origin')}/thank-you`,
      description: `Payment for ${serviceName} - Order #${orderId.slice(-6)}`,
      clientReference: orderId
    }

    // Make payment request to Hubtel
    const hubtelResponse = await fetch('https://api.hubtel.com/v1/merchantaccount/merchants/HM0000000/receive/mobilemoney', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${HUBTEL_API_ID}:${HUBTEL_API_KEY}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const paymentResult = await hubtelResponse.json()

    if (hubtelResponse.ok && paymentResult.responseCode === '0000') {
      // Payment initiated successfully
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment initiated successfully',
          transactionId: paymentResult.transactionId,
          checkoutUrl: paymentResult.checkoutUrl
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      // Payment failed
      return new Response(
        JSON.stringify({
          success: false,
          message: paymentResult.responseText || 'Payment initiation failed',
          error: paymentResult
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})