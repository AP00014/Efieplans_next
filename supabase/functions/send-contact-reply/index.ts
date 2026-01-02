// @ts-expect-error: Deno types not available in this environment
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;');
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

// @ts-expect-error: Deno types not available in this environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
// @ts-expect-error: Deno types not available in this environment
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
// @ts-expect-error: Deno types not available in this environment
const NEWSLETTER_FROM_EMAIL = Deno.env.get('NEWSLETTER_FROM_EMAIL') || 'no-reply@efieplans.com';
// @ts-expect-error: Deno types not available in this environment
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    persistSession: false
  }
});

const resend = new Resend(RESEND_API_KEY);

logInfo('CONTACT_REPLY', 'Function initialized');

serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  logInfo('CONTACT_REPLY', `Request started - ID: ${requestId}`, { method: req.method, url: req.url });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logInfo('CONTACT_REPLY', 'CORS preflight handled', { requestId });
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      status: 200
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Authenticate user - check for Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized - Missing or invalid Authorization header'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logError('CONTACT_REPLY', authError || new Error('Invalid token'), { requestId });
      return new Response(JSON.stringify({
        error: 'Unauthorized - Invalid token'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      logError('CONTACT_REPLY', profileError || new Error('Not admin'), { requestId, userId: user.id });
      return new Response(JSON.stringify({
        error: 'Forbidden - Admin access required'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const body = await req.json();

    if (!body.message_id || !body.reply) {
      return new Response(JSON.stringify({
        error: 'message_id and reply are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    logInfo('CONTACT_REPLY', 'Processing reply request', { requestId, messageId: body.message_id });

    // 1. Fetch contact message with ownership check
    const { data: contactMessage, error: fetchErr } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', body.message_id)
      .maybeSingle();

    if (fetchErr) {
      logError('CONTACT_REPLY', fetchErr, { requestId, messageId: body.message_id });
      return new Response(JSON.stringify({
        error: 'Failed to fetch contact message'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!contactMessage) {
      return new Response(JSON.stringify({
        error: 'Contact message not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 2. Update contact message status and store reply
    const { error: updateErr } = await supabase
      .from('contact_messages')
      .update({
        status: 'replied',
        reply: body.reply,
        reply_subject: body.reply_subject || `Re: ${contactMessage.subject || 'Your Contact Message'}`,
        reply_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', body.message_id);

    if (updateErr) {
      logError('CONTACT_REPLY', updateErr, { requestId, contactMessageId: body.contactMessageId });
      return new Response(JSON.stringify({
        error: 'Failed to update contact message'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    logInfo('CONTACT_REPLY', 'Contact message updated successfully', { requestId, contactMessageId: body.contactMessageId });

    // 3. Send reply email via Resend
    const subject = body.replySubject || `Re: ${contactMessage.subject || 'Your Contact Message'}`;
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for contacting Efie Plans</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear ${escapeHtml(contactMessage.name)},</p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745;">
            ${escapeHtml(body.reply).replace(/\n/g, '<br>')}
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 14px; color: #666;">
          <p><strong>Your original message:</strong></p>
          <p><em>${escapeHtml(contactMessage.message).replace(/\n/g, '<br>')}</em></p>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Best regards,<br>
          The Efie Plans Team
        </p>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: NEWSLETTER_FROM_EMAIL,
        to: contactMessage.email,
        subject: subject,
        html: replyHtml
      });

      if (error) throw error;

      logInfo('CONTACT_REPLY', 'Reply email sent successfully', { requestId, to: contactMessage.email, emailId: data?.id });
    } catch (e) {
      logError('CONTACT_REPLY', e, { requestId, to: contactMessage.email });
      return new Response(JSON.stringify({
        error: 'Failed to send email'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Reply sent successfully',
      requestId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    logError('CONTACT_REPLY', err, { requestId });
    return new Response(JSON.stringify({
      error: 'Internal server error',
      requestId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});