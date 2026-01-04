// @ts-expect-error: Deno environment
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'
// @ts-expect-error: Resend types not available in Deno environment
import { Resend } from "resend"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
}

interface NewsletterRequest {
  subject: string
  content: string
}

function logError(context: string, error: unknown, additionalData?: Record<string, unknown>) {
  console.error(`[${context}] Error:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    additionalData,
    timestamp: new Date().toISOString()
  });
}

function logInfo(context: string, message: string, data?: Record<string, unknown>) {
  console.log(`[${context}] ${message}`, data ? { data, timestamp: new Date().toISOString() } : { timestamp: new Date().toISOString() });
}

serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  logInfo('NEWSLETTER', `Request started - ID: ${requestId}`, { method: req.method, url: req.url });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logInfo('NEWSLETTER', 'CORS preflight handled', { requestId });
    return new Response(null, {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    logInfo('NEWSLETTER', 'Initializing Supabase client', { requestId });
    // Initialize Supabase client
    // @ts-expect-error: Deno types not available in this environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://wroqkppgfeqixyspxkmo.supabase.co'
    // @ts-expect-error: Deno types not available in this environment
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')

    logInfo('NEWSLETTER', 'Environment check', {
      requestId,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      hasAuthHeader: !!authHeader
    });

    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
    }

    if (!authHeader) {
      throw new Error('Authorization header is missing')
    }

    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Initialize Resend
    logInfo('NEWSLETTER', 'Initializing Resend', { requestId });
    // @ts-expect-error: Deno types not available in this environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    logInfo('NEWSLETTER', 'Resend API key check', { requestId, hasApiKey: !!resendApiKey });

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    const resend = new Resend(resendApiKey)

    // Get the newsletter data from the request
    logInfo('NEWSLETTER', 'Parsing request body', { requestId });
    const body = await req.json() as NewsletterRequest
    logInfo('NEWSLETTER', 'Request body parsed', { requestId, hasSubject: !!body.subject, hasContent: !!body.content });

    const { subject, content } = body

    if (!subject || !content) {
      throw new Error('Missing required fields: subject and content')
    }

    logInfo('NEWSLETTER', 'Validation passed', { requestId, subjectLength: subject.length, contentLength: content.length });

    // Fetch active email subscriptions and authenticated user emails
    logInfo('NEWSLETTER', 'Fetching email subscriptions', { requestId });
    const subscriptionsResult = await supabaseClient
      .from('email_subscriptions')
      .select('email')
      .eq('is_active', true)

    logInfo('NEWSLETTER', 'Subscriptions query completed', { requestId, error: subscriptionsResult.error, count: subscriptionsResult.data?.length });

    if (subscriptionsResult.error) {
      logError('NEWSLETTER', subscriptionsResult.error, { requestId });
      throw subscriptionsResult.error
    }

    logInfo('NEWSLETTER', 'Fetching user emails', { requestId });
    const usersResult = await supabaseClient
      .from('profiles')
      .select('email')
      .not('email', 'is', null)

    logInfo('NEWSLETTER', 'Users query completed', { requestId, error: usersResult.error, count: usersResult.data?.length });

    if (usersResult.error) {
      logError('NEWSLETTER', usersResult.error, { requestId });
      throw usersResult.error
    }

    const subscriptionEmails = subscriptionsResult.data?.map((sub: { email: string }) => sub.email) || []
    const userEmails = usersResult.data?.map((user: { email: string }) => user.email) || []

    logInfo('NEWSLETTER', 'Email collection completed', {
      requestId,
      subscriptionEmails: subscriptionEmails.length,
      userEmails: userEmails.length
    });

    // Combine and deduplicate emails
    const recipientEmails = Array.from(new Set([...subscriptionEmails, ...userEmails]))

    logInfo('NEWSLETTER', 'Recipient emails deduplicated', {
      requestId,
      totalUniqueEmails: recipientEmails.length,
      sampleEmails: recipientEmails.slice(0, 3)
    });

    if (recipientEmails.length === 0) {
      logInfo('NEWSLETTER', 'No email recipients found, returning early', { requestId });
      return new Response(
        JSON.stringify({ success: true, message: 'No email recipients found', recipientCount: 0, requestId }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Send newsletter to all subscribers
    logInfo('NEWSLETTER', 'Sending newsletter via Resend', { requestId, recipientCount: recipientEmails.length });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #333; margin: 0;">Efie Plans</h1>
          <p style="color: #666; margin: 5px 0;">Architectural & Construction Excellence</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 20px;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            You're receiving this because you subscribed to our newsletter.
          </p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">
            <a href="#" style="color: #007bff; text-decoration: none;">Unsubscribe</a> |
            <a href="#" style="color: #007bff; text-decoration: none;">Update Preferences</a>
          </p>
        </div>
      </div>
    `

    logInfo('NEWSLETTER', 'Email HTML prepared', { requestId, htmlLength: emailHtml.length });

    const { data, error } = await resend.emails.send({
      from: 'Efie Plans <newsletter@efieplans.com>',
      to: recipientEmails,
      subject: subject,
      html: emailHtml,
    })

    logInfo('NEWSLETTER', 'Resend API response received', { requestId, success: !error, emailId: data?.id });

    if (error) {
      logError('NEWSLETTER', error, { requestId });
      throw error
    }

    logInfo('NEWSLETTER', 'Newsletter sent successfully', { requestId, emailId: data?.id });

    // Record the newsletter send in the database
    logInfo('NEWSLETTER', 'Recording newsletter send in database', { requestId });
    const { error: insertError } = await supabaseClient
      .from('newsletter_sends')
      .insert({
        subject: subject,
        content: content,
        sent_at: new Date().toISOString(),
        recipient_count: recipientEmails.length
      })

    if (insertError) {
      logError('NEWSLETTER', insertError, { requestId, context: 'Failed to record newsletter send' });
      // Don't throw here, as the newsletter was already sent successfully
    } else {
      logInfo('NEWSLETTER', 'Newsletter send recorded successfully', { requestId });
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailId: data?.id,
        recipientCount: recipientEmails.length,
        requestId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logError('NEWSLETTER', error, { requestId });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({
        error: errorMessage,
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})