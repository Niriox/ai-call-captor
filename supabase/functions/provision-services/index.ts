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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get business record
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      throw new Error('Business not found');
    }

    console.log('Provisioning services for business:', business.id);

    // 1. Purchase Twilio phone number
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    // Search for available phone numbers (area code based on service area if possible)
    const searchResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/AvailablePhoneNumbers/US/Local.json?SmsEnabled=true&VoiceEnabled=true&Limit=1`,
      {
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
        },
      }
    );

    const searchData = await searchResponse.json();
    console.log('Available numbers:', searchData);

    if (!searchData.available_phone_numbers || searchData.available_phone_numbers.length === 0) {
      throw new Error('No available phone numbers found');
    }

    const phoneNumber = searchData.available_phone_numbers[0].phone_number;

    // Purchase the phone number
    const purchaseResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          PhoneNumber: phoneNumber,
          VoiceUrl: `https://genujygrllrnlkawdjhk.supabase.co/functions/v1/twilio-webhook`,
          VoiceMethod: 'POST',
          SmsUrl: `https://genujygrllrnlkawdjhk.supabase.co/functions/v1/twilio-webhook`,
          SmsMethod: 'POST',
        }),
      }
    );

    const purchaseData = await purchaseResponse.json();
    console.log('Purchased phone number:', purchaseData);

    if (!purchaseResponse.ok) {
      throw new Error(`Failed to purchase phone number: ${JSON.stringify(purchaseData)}`);
    }

    // 2. Create Bland AI agent
    const blandApiKey = Deno.env.get('BLAND_API_KEY');
    
    const agentPrompt = `You are an AI voicemail assistant for ${business.business_name}, a ${business.industry} business serving ${business.service_area}.

Your job is to answer calls when the business owner is busy and collect customer information. Be friendly, professional, and efficient.

Services offered: ${business.services_offered.join(', ')}

When a customer calls:
1. Greet them warmly and let them know you're the AI assistant
2. Ask for their name
3. Ask for their phone number (confirm it back to them)
4. Ask what service they need
5. Ask for their address if it's a service that requires a visit
6. Ask about urgency (ASAP, within a day, within a week, flexible)
7. Ask if they have any additional notes or details
8. Thank them and let them know ${business.business_name} will call them back soon

Keep the conversation natural and brief. If the customer seems in a hurry, prioritize getting their phone number and service needed.`;

    const blandResponse = await fetch('https://api.bland.ai/v1/agents', {
      method: 'POST',
      headers: {
        'Authorization': blandApiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: agentPrompt,
        voice: 'maya', // Professional, clear voice
        webhook: `${supabaseUrl}/functions/v1/bland-webhook`,
        transfer_phone_number: business.business_phone,
        language: 'en',
        max_duration: 5, // 5 minutes max
      }),
    });

    const blandData = await blandResponse.json();
    console.log('Created Bland AI agent:', blandData);

    if (!blandResponse.ok) {
      throw new Error(`Failed to create Bland AI agent: ${JSON.stringify(blandData)}`);
    }

    // 3. Update business record with phone number and agent info
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        twilio_number: phoneNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business.id);

    if (updateError) {
      console.error('Failed to update business:', updateError);
      throw updateError;
    }

    console.log('Successfully provisioned services');

    return new Response(
      JSON.stringify({
        success: true,
        twilio_number: phoneNumber,
        agent_id: blandData.agent_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in provision-services:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});