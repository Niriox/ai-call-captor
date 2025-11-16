import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Hash, CheckCircle, Copy, CreditCard, Loader2, Sparkles, ArrowRight, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const DashboardSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [twilioNumber, setTwilioNumber] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
        return;
      }

      // Fetch business data from database
      const { data, error } = await supabase
        .from("businesses")
        .select("twilio_number, stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business:", error);
        toast({
          title: "Error",
          description: "Failed to load your business data",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setTwilioNumber(data?.twilio_number || null);
      setStripeCustomerId(data?.stripe_customer_id || null);

      // Check if user has payment method via Stripe
      try {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('get-payment-method');
        
        if (!paymentError && paymentData) {
          setHasPaymentMethod(!!paymentData.paymentMethod);
        }
      } catch (err) {
        console.error("Error checking payment method:", err);
      }

      setLoading(false);
    };

    fetchBusinessData();
  }, [navigate, toast]);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      const areaCode = cleaned.slice(1, 4);
      const prefix = cleaned.slice(4, 7);
      const line = cleaned.slice(7);
      return `(${areaCode}) ${prefix}-${line}`;
    }
    if (cleaned.length === 10) {
      const areaCode = cleaned.slice(0, 3);
      const prefix = cleaned.slice(3, 6);
      const line = cleaned.slice(6);
      return `(${areaCode}) ${prefix}-${line}`;
    }
    return phone;
  };

  const getActivationCode = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return `*92${cleaned}#`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Payment gate if no payment method
  if (!stripeCustomerId && !hasPaymentMethod) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 hover:bg-background/80">
              ← Back to Dashboard
            </Button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <CreditCard className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Add Payment Method to Activate</h1>
              <p className="text-xl text-muted-foreground">
                Your AI Voicemail number will be provisioned immediately
              </p>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">14-day free trial</p>
                      <p className="text-sm text-muted-foreground">You won't be charged until day 15</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Cancel anytime</p>
                      <p className="text-sm text-muted-foreground">No commitment before trial ends</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Instant activation</p>
                      <p className="text-sm text-muted-foreground">Your dedicated phone number created instantly</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate("/dashboard/billing")} 
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Add Payment Method
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Questions? Email <a href="mailto:support@aivoicemail.co" className="text-primary hover:underline font-medium">support@aivoicemail.co</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Provisioning message if payment added but no twilio_number yet
  if (stripeCustomerId && !twilioNumber) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 hover:bg-background/80">
              ← Back to Dashboard
            </Button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Provisioning Your Number...</h1>
              <p className="text-xl text-muted-foreground">
                Creating your dedicated AI Voicemail number
              </p>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-4">
                  <Badge variant="secondary" className="px-4 py-1.5">
                    <Zap className="w-3 h-3 mr-1.5" />
                    Usually takes less than 60 seconds
                  </Badge>
                  
                  <p className="text-muted-foreground">
                    Your number is being set up in the background. Once ready, you'll be able to activate call forwarding in just 30 seconds.
                  </p>
                </div>

                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="w-full h-11"
                  size="lg"
                >
                  Refresh Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Full setup instructions when payment is added AND twilio_number exists
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 hover:bg-background/80">
            ← Back to Dashboard
          </Button>

          {/* Header Section */}
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Final Step
            </Badge>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Activate Your AI Voicemail
            </h1>
            <p className="text-xl text-muted-foreground">Takes 30 seconds · No technical skills needed</p>
          </div>

          {/* AI Number Display Section */}
          <Card className="mb-10 border-primary/30 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your AI Voicemail Number</CardTitle>
                <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {twilioNumber ? (
                <>
                  <div className="flex items-center justify-center gap-3 mb-3 p-6 bg-primary/5 rounded-lg border border-primary/20">
                    <Phone className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-4xl font-bold text-primary tracking-tight">
                      {formatPhoneNumber(twilioNumber)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 hover:bg-primary/10"
                      onClick={() => copyToClipboard(twilioNumber, "Phone number")}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Calls to this number will be handled by your AI assistant
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Setting up your number... refresh in 30 seconds</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setup Steps Section */}
          {twilioNumber && (
            <>
              <div className="space-y-5 mb-10">
                {/* Step 1 */}
                <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-start gap-5 pt-6 pb-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                        1
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Pick up your business phone</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">Use the phone you want to forward calls from</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2 */}
                <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-start gap-5 pt-6 pb-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                        2
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Hash className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Dial this activation code</h3>
                      </div>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 mb-3 border border-primary/20">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-3xl md:text-4xl font-bold font-mono text-primary tracking-wide">
                            {getActivationCode(twilioNumber)}
                          </span>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="flex-shrink-0 h-11 w-11"
                            onClick={() => copyToClipboard(getActivationCode(twilioNumber), "Activation code")}
                          >
                            <Copy className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This tells your carrier to forward unanswered calls to your AI
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3 */}
                <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-start gap-5 pt-6 pb-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                        3
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Press call and listen for beep</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        You'll hear a confirmation beep. That's it - your AI is now active!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Help Section */}
              <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <CardTitle>Test Your Setup</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Call your business number from another phone. Don't answer it. After a few rings, your AI should pick up and greet the caller.
                  </p>
                  <Button onClick={() => navigate("/dashboard")} className="w-full h-12 text-base shadow-md hover:shadow-lg transition-shadow">
                    I've Tested It - Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Troubleshooting */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Troubleshooting</CardTitle>
                  <CardDescription>Common questions and solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="hover:text-primary">What if I don't hear a beep?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        Make sure you dialed exactly *92 then your AI number then #. Try again and listen carefully for the confirmation tone.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="hover:text-primary">How do I turn it off?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        Dial <span className="font-mono font-semibold text-foreground">#92#</span> to deactivate call forwarding instantly.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="hover:text-primary">Need help?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        Email us at <a href="mailto:support@aivoicemail.co" className="text-primary hover:underline font-medium">support@aivoicemail.co</a> and we'll help you get set up within 24 hours.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSetup;
