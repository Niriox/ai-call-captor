import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signin");
        return;
      }
      setUserEmail(session.user.email || "");
      
      // Get selected plan from session storage or user metadata
      const plan = sessionStorage.getItem("selected_plan") || session.user.user_metadata?.selected_plan;
      setSelectedPlan(plan);
    });
  }, [navigate]);

  const handleComplete = () => {
    // Clear session storage
    sessionStorage.removeItem("selected_plan");
    // Redirect to main app
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elegant animate-fade-up">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome to AI Voicemail!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your account has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/30 rounded-lg p-6 space-y-2">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{userEmail}</p>
            
            {selectedPlan && (
              <>
                <p className="text-sm text-muted-foreground mt-4">Selected Plan</p>
                <p className="font-medium capitalize">{selectedPlan}</p>
              </>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's Next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Connect Your Phone Number</p>
                  <p className="text-sm text-muted-foreground">Link your business phone to start using AI answering</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Customize Your AI Greeting</p>
                  <p className="text-sm text-muted-foreground">Set up how your AI assistant greets customers</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Test Your First Call</p>
                  <p className="text-sm text-muted-foreground">Make a test call to see AI Voicemail in action</p>
                </div>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleComplete}
            size="lg"
            className="w-full"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
