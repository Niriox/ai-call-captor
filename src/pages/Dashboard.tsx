import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Phone, Settings, CreditCard, User, LogOut, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BusinessData {
  business_name: string;
  selected_plan: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock stats - replace with real data later
  const totalCalls = 0;
  const thisMonthCalls = 0;
  const minutesUsed = 0;
  
  // Plan minutes mapping
  const planMinutes: Record<string, number> = {
    starter: 20,
    professional: 60,
    business: 250,
    enterprise: 999,
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const loadDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/signin");
        return;
      }

      setUserEmail(session.user.email || "");

      // Fetch business data
      const { data, error } = await supabase
        .from("businesses")
        .select("business_name, selected_plan")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error loading dashboard",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data) {
        // No business data, redirect to onboarding
        navigate("/onboarding");
        return;
      }

      setBusinessData(data);
      setIsLoading(false);
    };

    loadDashboardData();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/signin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    navigate("/signin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!businessData) {
    return null;
  }

  const planMinutesLimit = planMinutes[businessData.selected_plan] || 0;
  const minutesRemaining = planMinutesLimit - minutesUsed;
  const usagePercentage = (minutesUsed / planMinutesLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Top Navigation */}
      <nav className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Phone className="w-6 h-6" />
              AI Voicemail
            </a>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-foreground font-medium hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="/dashboard/settings" className="text-muted-foreground hover:text-primary transition-colors">
                Settings
              </a>
              <a href="/billing" className="text-muted-foreground hover:text-primary transition-colors">
                Billing
              </a>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {businessData.business_name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{businessData.business_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {businessData.business_name}!
          </h1>
          <Badge variant="secondary" className="text-sm capitalize">
            {businessData.selected_plan} Plan
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Calls</CardDescription>
              <CardTitle className="text-4xl">{totalCalls}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-4xl">{thisMonthCalls}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Calls in {currentMonth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Minutes Used</CardDescription>
              <CardTitle className="text-4xl">
                {minutesUsed} / {planMinutesLimit}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {minutesRemaining} minutes remaining
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Calls Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                We'll notify you via SMS and email when you receive your first call
              </p>
              <Button variant="outline" onClick={() => navigate("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Test Your Setup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Setup</CardTitle>
            <CardDescription>⚡ Your AI is ready! Just activate it (30 seconds)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Activate call forwarding (30 seconds)</span>
              </div>
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Test your AI voicemail</span>
              </div>
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Customize your greeting (optional)</span>
              </div>
            </div>
            <Button onClick={() => navigate("/dashboard/setup")}>
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
