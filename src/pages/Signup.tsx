import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PlanType = "starter" | "professional" | "business" | "enterprise";

const plans = [
  { id: "starter", name: "Starter", price: "$35/month", highlighted: false },
  { id: "professional", name: "Professional", price: "$100/month", highlighted: true },
  { id: "business", name: "Business", price: "$300/month", highlighted: false },
  { id: "enterprise", name: "Enterprise", price: "Contact Sales", highlighted: false },
];

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Set plan from URL parameter
    const planParam = searchParams.get("plan");
    if (planParam && plans.some(p => p.id === planParam)) {
      setSelectedPlan(planParam as PlanType);
    }
  }, [searchParams, navigate]);

  const handlePlanSelect = (planId: string) => {
    if (planId === "enterprise") {
      // Redirect to contact form (placeholder)
      window.location.href = "mailto:sales@aivoicemail.com";
      return;
    }
    setSelectedPlan(planId as PlanType);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = signupSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            selected_plan: selectedPlan,
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setErrors({ email: "This email is already registered. Please sign in." });
        } else {
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Store selected plan in session storage for onboarding
      sessionStorage.setItem("selected_plan", selectedPlan);

      toast({
        title: "Account created successfully!",
        description: "Redirecting to onboarding...",
      });

      // Redirect to onboarding
      setTimeout(() => {
        navigate("/onboarding");
      }, 1000);
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Plan Selector - shown if no plan in URL */}
        {!selectedPlan && (
          <div className="mb-8 animate-fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-elegant ${
                    plan.highlighted ? 'border-primary border-2' : 'border-2'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <CardHeader className="text-center">
                    {plan.highlighted && (
                      <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
                    )}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-foreground mt-2">
                      {plan.price}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Signup Form */}
        {selectedPlan && (
          <Card className="max-w-md mx-auto shadow-elegant animate-fade-up">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">Start your 14-day free trial</CardTitle>
              <CardDescription className="text-lg mt-2">
                {selectedPlanDetails?.name} Plan - {selectedPlanDetails?.price}
              </CardDescription>
              {selectedPlan !== plans[0].id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlan(null)}
                  className="mt-2"
                >
                  Change plan
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/signin" className="text-primary hover:underline font-medium">
                    Sign in
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Signup;
