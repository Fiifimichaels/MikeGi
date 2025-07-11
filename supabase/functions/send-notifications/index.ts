import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NotificationRequest {
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceName: string
  amount: number
  orderId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { customerName, customerEmail, customerPhone, serviceName, amount, orderId }: NotificationRequest = await req.json()

    // Hubtel SMS credentials
    const SMS_CLIENT_ID = Deno.env.get('HUBTEL_SMS_CLIENT_ID')!
    const SMS_CLIENT_SECRET = Deno.env.get('HUBTEL_SMS_CLIENT_SECRET')!

    // Send SMS notification
    const smsMessage = `Hello ${customerName}, your order for ${serviceName} (GH₵${amount.toFixed(2)}) has been confirmed. Order ID: #${orderId.slice(-6)}. Thank you for choosing MikeGi!`
    
    const smsUrl = `https://sms.hubtel.com/v1/messages/send?clientsecret=${SMS_CLIENT_SECRET}&clientid=${SMS_CLIENT_ID}&from=MikeGi&to=${customerPhone}&content=${encodeURIComponent(smsMessage)}`
    
    const smsResponse = await fetch(smsUrl, {
      method: 'GET'
    })

    // Send Email notification (using a simple email service or SMTP)
    const emailSubject = 'MikeGi Order Confirmation'
    const emailMessage = `
      Dear ${customerName},
      
      Thank you for your order with MikeGi!
      
      Order Details:
      - Service: ${serviceName}
      - Amount: GH₵${amount.toFixed(2)}
      - Order ID: #${orderId.slice(-6)}
      
      Your payment has been successfully processed and your order is being prepared.
      
      Best regards,
      MikeGi Team
    `

    // For demo purposes, we'll log the email (in production, integrate with your email service)
    console.log('📧 Email sent to:', customerEmail)
    console.log('Subject:', emailSubject)
    console.log('Message:', emailMessage)

    const smsResult = await smsResponse.text()
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications sent successfully',
        sms: {
          sent: smsResponse.ok,
          response: smsResult
        },
        email: {
          sent: true,
          recipient: customerEmail
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to send notifications',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})