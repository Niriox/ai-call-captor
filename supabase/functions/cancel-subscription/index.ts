import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get subscription ID from database
    const { data: business } = await supabaseClient
      .from("businesses")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!business?.stripe_subscription_id) {
      throw new Error("No active subscription found");
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(
      business.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    // Update database
    await supabaseClient
      .from("businesses")
      .update({ subscription_status: "canceled" })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        endsAt: new Date(subscription.current_period_end * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in cancel-subscription:", error);
    return new Response(JSON.stringify({ error: "Unable to cancel subscription" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
