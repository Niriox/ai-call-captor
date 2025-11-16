import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

const OnboardingPayment = () => {
  const navigate = useNavigate();
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signin");
        return;
      }

      // Fetch business info to verify onboarding was completed
      supabase
        .from("businesses")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            // If no business info, redirect back to onboarding
            navigate("/onboarding");
            return;
          }
          setBusinessInfo(data);
        });
    });
  }, [navigate]);

  const handleContinue = () => {
    // Redirect to dashboard
    navigate("/dashboard");
  };

  if (!businessInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elegant animate-fade-up">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Payment Setup</CardTitle>
          <CardDescription className="text-lg mt-2">
            Configure your payment method for {businessInfo.selected_plan} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Business Name</span>
              <span className="font-medium">{businessInfo.business_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Selected Plan</span>
              <span className="font-medium capitalize">{businessInfo.selected_plan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">14-Day Free Trial</span>
              <span className="font-medium text-primary">Active</span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-center">
              <strong>Good news!</strong> Your 14-day free trial starts now. We'll remind you before it ends.
              No payment required today.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>We'll set up your AI phone assistant with your business details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>You'll receive setup instructions via email within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Test calls are available immediately after setup</span>
              </li>
            </ul>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              Almost done! One quick step to activate your AI Voicemail.
            </p>
            <Button onClick={() => navigate("/dashboard/setup")} size="lg" className="w-full">
              Complete Setup (30 seconds)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPayment;
