import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const from = formData.get('From');
    const to = formData.get('To');
    const callSid = formData.get('CallSid');

    console.log('Incoming call from:', from, 'to:', to, 'CallSid:', callSid);

    const blandApiKey = Deno.env.get('BLAND_API_KEY');

    // Trigger Bland AI to handle the call
    const blandResponse = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': blandApiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: from,
        from: to, // The Twilio number
        task: 'answer_inbound',
        wait_for_greeting: true,
        record: true,
        metadata: {
          twilio_call_sid: callSid,
        },
      }),
    });

    const blandData = await blandResponse.json();
    console.log('Bland AI call initiated:', blandData);

    // Respond to Twilio with TwiML to forward call to Bland AI
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Please hold while we connect you.</Say>
  <Dial>${blandData.call_id || from}</Dial>
</Response>`;

    return new Response(twiml, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error in twilio-webhook:', error);
    
    // Return error TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">We're sorry, but we're unable to take your call right now. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return new Response(errorTwiml, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml',
      },
    });
  }
});