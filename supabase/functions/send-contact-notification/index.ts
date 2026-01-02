// @ts-expect-error: Deno types not available in this environment
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @ts-expect-error: Resend types not available in Deno environment
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
}

interface ContactRecord {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
  logInfo('CONTACT_NOTIFICATION', `Request started - ID: ${requestId}`, { method: req.method, url: req.url });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logInfo('CONTACT_NOTIFICATION', 'CORS preflight handled', { requestId });
    return new Response(null, {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    // Initialize Supabase client for database operations
    // @ts-expect-error: Deno types not available in this environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-expect-error: Deno types not available in this environment
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false
      }
    });

    // Initialize Resend
    // @ts-expect-error: Deno types not available in this environment
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Get the contact message data from the request
    const { record }: { record: ContactRecord } = await req.json()

    if (!record) {
      throw new Error('No record data provided')
    }

    const { name, email, subject, message } = record

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error('Missing required fields: name, email, subject, message')
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    // Sanitize inputs to prevent HTML injection
    const sanitizedName = escapeHtml(name)
    const sanitizedEmail = escapeHtml(email)
    const sanitizedSubject = escapeHtml(subject)
    const sanitizedMessage = escapeHtml(message)

    logInfo('CONTACT_NOTIFICATION', 'Validation passed, storing contact message', { requestId, email: sanitizedEmail });

    // Store contact message in database
    const { data: contactData, error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      logError('CONTACT_NOTIFICATION', dbError, { requestId, email: sanitizedEmail });
      throw new Error(`Failed to store contact message: ${dbError.message}`);
    }

    logInfo('CONTACT_NOTIFICATION', 'Contact message stored successfully', { requestId, contactId: contactData.id });

    // Send notification email to admin
    logInfo('CONTACT_NOTIFICATION', 'Sending admin notification email', { requestId });

    const { data, error } = await resend.emails.send({
      from: 'Efie Plans <noreply@efieplans.com>',
      // @ts-expect-error: Deno types not available in this environment
      to: [Deno.env.get('ADMIN_EMAIL') ?? 'admin@efieplans.com'],
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message Received</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
              ${sanitizedMessage.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">
            This message was sent from your website contact form.
          </p>
        </div>
      `,
    })

    if (error) {
      logError('CONTACT_NOTIFICATION', error, { requestId });
      throw error
    }

    logInfo('CONTACT_NOTIFICATION', 'Admin notification sent successfully', { requestId, emailId: data?.id });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: data?.id,
        contactId: contactData.id,
        requestId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logError('CONTACT_NOTIFICATION', error, { requestId });
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