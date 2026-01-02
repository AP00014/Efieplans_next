# Supabase Edge Functions

This directory contains Supabase Edge Functions for handling email functionality using Resend.

## Functions

### 1. send-contact-notification
Sends an email notification to the admin when a new contact message is submitted.

**Trigger**: Database trigger on `contact_messages` table insert

**Environment Variables Required**:
- `RESEND_API_KEY`
- `ADMIN_EMAIL`

### 2. send-contact-reply
Sends a reply email to a contact message sender.

**Usage**: Call via HTTP POST with JSON body:
```json
{
  "contactMessageId": "uuid",
  "replyMessage": "Your reply content",
  "replySubject": "Optional custom subject"
}
```

**Environment Variables Required**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

### 3. send-newsletter
Sends a newsletter to all active email subscribers.

**Usage**: Call via HTTP POST with JSON body:
```json
{
  "subject": "Newsletter Subject",
  "content": "Newsletter content in HTML"
}
```

**Environment Variables Required**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

## Setup

1. Copy `.env.example` to `.env.local` and fill in your values
2. Deploy functions to Supabase:
   ```bash
   supabase functions deploy send-contact-notification
   supabase functions deploy send-contact-reply
   supabase functions deploy send-newsletter
   ```

3. Set up database triggers for automatic notifications:
   ```sql
   CREATE OR REPLACE FUNCTION notify_contact_message()
   RETURNS trigger AS $$
   BEGIN
     PERFORM
       net.http_post(
         url := 'https://your-project.supabase.co/functions/v1/send-contact-notification',
         headers := jsonb_build_object(
           'Content-Type', 'application/json',
           'Authorization', 'Bearer ' || 'your-service-role-key'
         ),
         body := jsonb_build_object('record', NEW)
       );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER contact_message_notification
     AFTER INSERT ON contact_messages
     FOR EACH ROW EXECUTE FUNCTION notify_contact_message();
   ```

## Email Service

These functions use [Resend](https://resend.com) for email delivery. Sign up for a Resend account and get your API key.

## Security

- Functions use service role key for database operations
- CORS headers are configured for web app access
- Input validation is performed on all requests