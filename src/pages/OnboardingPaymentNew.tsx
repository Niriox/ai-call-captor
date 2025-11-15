import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLAN_CONFIG = {
  starter: {
    priceId: "price_1STovGB8lhGmzgrHSMtACo2L",
    productId: "prod_TQgHpRjaK0IzIc",
    price: 35,
    minutes: 100,
    features: [
      "100 minutes/month",
      "AI-powered call handling",
      "Email notifications",
      "Basic analytics"
    ]
  },
  professional: {
    priceId: "price_1STox0B8lhGmzgrH3OeOjzfp",
    productId: "prod_TQgJBCtxPp12LQ",
    price: 100,
    minutes: 300,
    features: [
      "300 minutes/month",
      "Advanced AI responses",
      "SMS & Email notifications",
      "Advanced analytics",
      "Priority support"
    ]
  },
  business: {
    priceId: "price_1SToxfB8lhGmzgrH1DbhFhsz",
    productId: "prod_TQgKhkqlDv64KS",
    price: 300,
    minutes: 1000,
    features: [
      "1000 minutes/month",
      "Custom AI training",
      "Multi-channel notifications",
      "Full analytics suite",
      "24/7 priority support",
      "Dedicated account manager"
    ]
  }
};

const OnboardingPaymentNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if returning from successful payment
    if (searchParams.get("success") === "true") {
      checkSubscriptionStatus();
      return;
    }

    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signin");
        return;
      }

      // Fetch business info
      supabase
        .from("businesses")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            navigate("/onboarding");
            return;
          }
          setBusinessInfo(data);
        });
    });
  }, [navigate, searchParams]);

  const checkSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;

      if (data?.subscribed) {
        setSuccess(true);
        toast({
          title: "Payment successful!",
          description: "Your subscription is now active.",
        });
      }
    } catch (error: any) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!businessInfo) return;

    setLoading(true);
    try {
      const planConfig = PLAN_CONFIG[businessInfo.selected_plan as keyof typeof PLAN_CONFIG];
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: planConfig.priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  if (!businessInfo) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-elegant animate-fade-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">You're all set! 🎉</CardTitle>
            <CardDescription className="text-lg mt-2">
              Your AI Voicemail is being configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/30 rounded-lg p-6 space-y-4 text-center">
              <p className="text-muted-foreground">
                Your AI phone assistant will be ready within 24 hours
              </p>
              <p className="text-muted-foreground">
                We've sent setup instructions to <strong>{businessInfo.notification_email}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Your 14-day free trial has started</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>AI assistant setup will complete within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Test calls available immediately after setup</span>
                </li>
              </ul>
            </div>

            <Button onClick={handleContinue} size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planConfig = PLAN_CONFIG[businessInfo.selected_plan as keyof typeof PLAN_CONFIG];
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Final Step - Payment</p>
          <h1 className="text-3xl font-bold">Complete Your {businessInfo.selected_plan} Subscription</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan Summary */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-sm capitalize">
                  {businessInfo.selected_plan}
                </Badge>
                <p className="text-2xl font-bold">${planConfig.price}/month</p>
              </div>
              <CardTitle className="capitalize">{businessInfo.selected_plan} Plan</CardTitle>
              <CardDescription>{planConfig.minutes} minutes included</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Business Name</span>
                  <span className="font-medium">{businessInfo.business_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium capitalize">{businessInfo.industry}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {planConfig.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/signup?plan=" + businessInfo.selected_plan)}
              >
                Change plan
              </Button>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Start your 14-day free trial - no charge today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">14-Day Free Trial</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You won't be charged until {trialEndDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Click below to enter payment details securely with Stripe
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secured by Stripe</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleStartTrial} 
                  size="lg" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Start Free Trial"}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/onboarding")}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime, no questions asked
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPaymentNew;
