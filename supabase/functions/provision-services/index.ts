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

    const blandApiKey = Deno.env.get('BLAND_API_KEY');
    const blandWebhookUrl = `${supabaseUrl}/functions/v1/bland-webhook`;

    // Optional flag to force purchasing a brand-new number
    let forceNew = false;
    try {
      if (req.headers.get('content-type')?.includes('application/json')) {
        const body = await req.json();
        forceNew = !!body.forceNew;
      }
    } catch (_) {
      // ignore body parse errors
    }

    let phoneNumber: string | null = business.twilio_number;

    // 1. Purchase or use existing Bland.ai phone number
    if (!phoneNumber || forceNew) {
      // First, try to reuse an existing Bland.ai number if available (avoids needing a payment method)
      try {
        const listResponse = await fetch('https://api.bland.ai/numbers', {
          method: 'GET',
          headers: {
            'Authorization': blandApiKey!,
          },
        });
        const listData = await listResponse.json();
        console.log('Bland existing numbers response:', listData);
        const existingNumber = Array.isArray(listData?.numbers) && listData.numbers.length > 0
          ? listData.numbers[0]?.phone_number
          : null;
        if (existingNumber && !forceNew) {
          phoneNumber = existingNumber;
        }
      } catch (e) {
        console.warn('Failed to list Bland numbers (continuing to purchase):', e);
      }

      // If no existing number (or forceNew), attempt a purchase
      if (!phoneNumber || forceNew) {
        const purchaseResponse = await fetch('https://api.bland.ai/numbers/purchase', {
          method: 'POST',
          headers: {
            'Authorization': blandApiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            area_code: '415', // Default area code, could be customized based on service_area
            country_code: 'US',
          }),
        });

        const purchaseData = await purchaseResponse.json();
        console.log('Bland phone purchase response:', purchaseData);

        if (!purchaseResponse.ok) {
          const rawMsg = JSON.stringify(purchaseData);
          
          // Check for SUBSCRIPTION_NOT_ACTIVE error
          if (rawMsg.includes('SUBSCRIPTION_NOT_ACTIVE')) {
            return new Response(
              JSON.stringify({
                error: 'Bland.ai requires an active subscription plan. Please visit https://app.bland.ai/settings/billing to subscribe to a plan.',
                code: 'BLAND_SUBSCRIPTION_REQUIRED',
              }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // Specific handling for missing payment method on Bland account
          if (rawMsg.includes('MISSING_PAYMENT_METHOD')) {
            // Fallback: try to reuse an existing number even when forceNew was requested
            try {
              const listResponse2 = await fetch('https://api.bland.ai/numbers', {
                method: 'GET',
                headers: { 'Authorization': blandApiKey! },
              });
              const listData2 = await listResponse2.json();
              console.log('Bland numbers after purchase failure:', listData2);
              const existingNumber2 = Array.isArray(listData2?.numbers) && listData2.numbers.length > 0
                ? listData2.numbers[0]?.phone_number
                : null;
              if (existingNumber2) {
                phoneNumber = existingNumber2;
              } else {
                return new Response(
                  JSON.stringify({
                    error: 'Bland account is missing a payment method. Please add a card to the Bland account tied to BLAND_API_KEY or contact support.',
                    code: 'BLAND_MISSING_PAYMENT_METHOD',
                  }),
                  { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            } catch (_) {
              return new Response(
                JSON.stringify({
                  error: 'Bland account is missing a payment method. Please add a card to the Bland account tied to BLAND_API_KEY or contact support.',
                  code: 'BLAND_MISSING_PAYMENT_METHOD',
                }),
                { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } else {
            throw new Error(`Failed to purchase Bland phone number: ${rawMsg}`);
          }
        }

        if (purchaseResponse.ok) {
          phoneNumber = purchaseData.phone_number;
        }
      }
    }

    // 2. Create AI agent prompt
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

    // Verify we have a phone number before configuring
    if (!phoneNumber) {
      throw new Error('No phone number available for configuration');
    }

    // 3. Configure the Bland.ai inbound number with AI agent and webhook
    const updateNumberResponse = await fetch(
      `https://api.bland.ai/v1/inbound/${encodeURIComponent(phoneNumber)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': blandApiKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: agentPrompt,
          voice: 'maya',
          webhook: blandWebhookUrl,
          transfer_phone_number: business.business_phone,
          language: 'en',
          max_duration: 5,
          record: true,
        }),
      }
    );

    const updateNumberData = await updateNumberResponse.json();
    console.log('Configured Bland inbound number:', updateNumberData);

    if (!updateNumberResponse.ok) {
      throw new Error(`Failed to configure Bland inbound number: ${JSON.stringify(updateNumberData)}`);
    }

    // 4. Update business record with phone number
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

    console.log('Successfully provisioned Bland.ai services');

    return new Response(
      JSON.stringify({
        success: true,
        twilio_number: phoneNumber,
        message: 'Phone number provisioned with Bland.ai',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in provision-services:', error);

    // Bubble up a clearer status when Bland payment is missing
    if (error instanceof Error && error.message.includes('MISSING_PAYMENT_METHOD')) {
      return new Response(
        JSON.stringify({
          error: 'Bland account is missing a payment method. Please add a card to the Bland account tied to BLAND_API_KEY or contact support.',
          code: 'BLAND_MISSING_PAYMENT_METHOD'
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
