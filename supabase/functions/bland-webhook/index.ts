import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Bland AI webhook payload:', payload);

    // Extract customer information from the call transcript
    const transcript = payload.transcript || [];
    const callId = payload.call_id;
    const fromNumber = payload.from;
    const toNumber = payload.to;
    const duration = payload.call_length;
    const recordingUrl = payload.recording_url;

    // Find the business by Twilio number
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('twilio_number', toNumber)
      .single();

    if (businessError || !business) {
      console.error('Business not found for number:', toNumber);
      throw new Error('Business not found');
    }

    // Parse customer information from transcript
    let customerName = '';
    let customerPhone = fromNumber;
    let serviceNeeded = '';
    let customerAddress = '';
    let urgency = 'flexible';
    let notes = '';

    // Simple extraction from transcript (in production, you'd want more robust parsing)
    const fullTranscript = transcript.map((t: any) => t.text).join(' ');
    
    // Extract name (look for patterns like "my name is X" or "I'm X")
    const nameMatch = fullTranscript.match(/(?:my name is|I'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch) customerName = nameMatch[1];

    // Extract phone number (look for 10 digit numbers)
    const phoneMatch = fullTranscript.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) customerPhone = phoneMatch[1];

    // Extract service needed
    const serviceKeywords = business.services_offered.join('|');
    const serviceMatch = fullTranscript.match(new RegExp(`(${serviceKeywords})`, 'i'));
    if (serviceMatch) serviceNeeded = serviceMatch[1];

    // Extract urgency
    if (/asap|urgent|emergency|right away|immediately/i.test(fullTranscript)) {
      urgency = 'asap';
    } else if (/today|within a day/i.test(fullTranscript)) {
      urgency = 'within_day';
    } else if (/week|few days/i.test(fullTranscript)) {
      urgency = 'within_week';
    }

    // Save call to database
    const { data: callRecord, error: callError } = await supabase
      .from('calls')
      .insert({
        business_id: business.id,
        customer_name: customerName || 'Unknown',
        customer_phone: customerPhone,
        customer_address: customerAddress,
        service_needed: serviceNeeded || 'Not specified',
        urgency: urgency,
        call_status: 'completed',
        call_duration_seconds: duration || 0,
        call_transcript: transcript,
        call_recording_url: recordingUrl,
      })
      .select()
      .single();

    if (callError) {
      console.error('Failed to save call:', callError);
      throw callError;
    }

    console.log('Call saved:', callRecord);

    // Send SMS notification to business owner
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const urgencyEmoji = urgency === 'asap' ? '🔴' : urgency === 'within_day' ? '🟡' : '🟢';
    const smsBody = `🔔 New call from customer

${customerName || 'Unknown'}
${customerPhone}

Service: ${serviceNeeded || 'Not specified'}
${customerAddress ? `Address: ${customerAddress}` : ''}
Urgency: ${urgency.toUpperCase()} ${urgencyEmoji}

${notes ? `Notes: ${notes}` : 'Call back to schedule appointment'}`;

    const smsResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: business.notification_phone,
          From: business.twilio_number,
          Body: smsBody,
        }),
      }
    );

    const smsData = await smsResponse.json();
    console.log('SMS sent:', smsData);

    if (!smsResponse.ok) {
      console.error('Failed to send SMS:', smsData);
    }

    return new Response(
      JSON.stringify({ success: true, call_id: callRecord.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in bland-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});