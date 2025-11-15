import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      numLocations,
      estimatedCalls,
      currentSolution,
      message,
    } = await req.json();

    // For now, just log the notification
    // To enable email notifications:
    // 1. Sign up at https://resend.com
    // 2. Validate your domain at https://resend.com/domains
    // 3. Create an API key at https://resend.com/api-keys
    // 4. Add RESEND_API_KEY secret via Lovable
    // 5. Uncomment the Resend code below

    console.log("Enterprise inquiry received:", {
      name: `${firstName} ${lastName}`,
      email,
      company: companyName,
    });

    /* Uncomment this when Resend is set up:
    
    import { Resend } from "npm:resend@2.0.0";
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Send notification to sales team
    await resend.emails.send({
      from: "AI Voicemail <sales@yourdomain.com>",
      to: ["sales@yourdomain.com"],
      subject: `New Enterprise Inquiry from ${companyName}`,
      html: `
        <h2>New Enterprise Inquiry</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Locations:</strong> ${numLocations}</p>
        <p><strong>Estimated Calls:</strong> ${estimatedCalls}</p>
        <p><strong>Current Solution:</strong> ${currentSolution || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message || "No message provided"}</p>
      `,
    });

    // Send confirmation to customer
    await resend.emails.send({
      from: "AI Voicemail <onboarding@yourdomain.com>",
      to: [email],
      subject: "Thank you for your enterprise inquiry",
      html: `
        <h2>Thank you for your interest!</h2>
        <p>Hi ${firstName},</p>
        <p>We've received your inquiry about our Enterprise plan and will contact you within 24 hours.</p>
        <p>In the meantime, here are some resources:</p>
        <ul>
          <li>Enterprise Features Overview</li>
          <li>Customer Success Stories</li>
          <li>Integration Documentation</li>
        </ul>
        <p>Best regards,<br>The AI Voicemail Team</p>
      `,
    });
    */

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-enterprise-notification:", error);
    return new Response(
      JSON.stringify({ error: "Unable to process enterprise inquiry" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
