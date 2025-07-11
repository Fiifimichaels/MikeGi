import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AdminNotificationRequest {
  userName: string
  userPhone: string
  message: string
  chatId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userName, userPhone, message, chatId }: AdminNotificationRequest = await req.json()

    // In a real application, you would:
    // 1. Send email notification to admin
    // 2. Send push notification to admin dashboard
    // 3. Log the notification for tracking

    console.log('📧 Admin Notification:')
    console.log(`New chat message from: ${userName} (${userPhone})`)
    console.log(`Message: ${message}`)
    console.log(`Chat ID: ${chatId}`)

    // Here you could integrate with email services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Or any other email service

    // Example email content
    const emailSubject = `New Chat Message from ${userName}`
    const emailContent = `
      You have received a new chat message from a customer:
      
      Customer: ${userName}
      Phone: ${userPhone}
      Message: ${message}
      
      Please log into the admin dashboard to respond.
      
      Chat ID: ${chatId}
    `

    // For demo purposes, we'll just log the notification
    console.log('Email Subject:', emailSubject)
    console.log('Email Content:', emailContent)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin notification sent successfully',
        notificationDetails: {
          recipient: 'admin@mikegi.com',
          subject: emailSubject,
          chatId: chatId
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Admin notification error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to send admin notification',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})