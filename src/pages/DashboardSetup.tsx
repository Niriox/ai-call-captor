import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Hash, CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [twilioNumber, setTwilioNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
        return;
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("twilio_number")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business:", error);
        toast({
          title: "Error",
          description: "Failed to load your AI number",
          variant: "destructive",
        });
      } else {
        setTwilioNumber(data?.twilio_number || null);
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            ← Back to Dashboard
          </Button>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Activate Your AI Voicemail</h1>
            <p className="text-xl text-muted-foreground">Takes 30 seconds. No technical skills needed.</p>
          </div>

          {/* AI Number Display Section */}
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Your AI Voicemail Number</CardTitle>
            </CardHeader>
            <CardContent>
              {twilioNumber ? (
                <>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {formatPhoneNumber(twilioNumber)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(twilioNumber, "Phone number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Calls to this number will be handled by your AI
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
              <div className="space-y-4 mb-8">
                {/* Step 1 */}
                <Card>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Pick up your business phone</h3>
                      </div>
                      <p className="text-muted-foreground">Use the phone you want to forward calls from</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2 */}
                <Card>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Dial this activation code</h3>
                      </div>
                      <div className="bg-muted rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold font-mono">
                            {getActivationCode(twilioNumber)}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(getActivationCode(twilioNumber), "Activation code")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This tells your carrier to forward unanswered calls to your AI
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3 */}
                <Card>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Press call and listen for beep</h3>
                      </div>
                      <p className="text-muted-foreground">
                        You'll hear a confirmation beep. That's it - your AI is now active!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Help Section */}
              <Card className="mb-8 bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Test Your Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Call your business number from another phone. Don't answer it. After 5 seconds, your AI should pick up.
                  </p>
                  <Button onClick={() => navigate("/dashboard")} className="w-full">
                    I've Tested It - Go to Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Troubleshooting */}
              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting</CardTitle>
                  <CardDescription>Common questions and solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What if I don't hear a beep?</AccordionTrigger>
                      <AccordionContent>
                        Make sure you dialed exactly *92 then your AI number then #. Try again.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>How do I turn it off?</AccordionTrigger>
                      <AccordionContent>
                        Dial #92# to deactivate call forwarding.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Need help?</AccordionTrigger>
                      <AccordionContent>
                        Email us at support@aivoicemail.co and we'll help you get set up.
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
