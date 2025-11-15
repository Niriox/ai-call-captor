import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Download, 
  Lock, 
  AlertTriangle,
  TrendingUp,
  Phone,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PLAN_CONFIG = {
  starter: {
    priceId: "price_1STovGB8lhGmzgrHSMtACo2L",
    name: "Starter Plan",
    price: 35,
    minutes: 100,
    overageRate: 0.50,
  },
  professional: {
    priceId: "price_1STox0B8lhGmzgrH3OeOjzfp",
    name: "Professional Plan",
    price: 100,
    minutes: 300,
    overageRate: 0.40,
  },
  business: {
    priceId: "price_1SToxfB8lhGmzgrH1DbhFhsz",
    name: "Business Plan",
    price: 300,
    minutes: 1000,
    overageRate: 0.30,
  }
};

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
        return;
      }

      // Load business info
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (businessError || !business) {
        toast({
          title: "Error",
          description: "Failed to load business information",
          variant: "destructive",
        });
        return;
      }

      setBusinessInfo(business);

      // Load subscription status
      const { data: subData, error: subError } = await supabase.functions.invoke("check-subscription");
      if (!subError && subData) {
        setSubscriptionData(subData);
      }

      // Load payment method
      const { data: pmData, error: pmError } = await supabase.functions.invoke("get-payment-method");
      if (!pmError && pmData?.paymentMethod) {
        setPaymentMethod(pmData.paymentMethod);
      }

      // Load billing history
      const { data: invoiceData, error: invError } = await supabase.functions.invoke("get-billing-history");
      if (!invError && invoiceData?.invoices) {
        setInvoices(invoiceData.invoices);
      }
    } catch (error: any) {
      console.error("Error loading billing data:", error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open payment portal",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelConfirm) return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      if (error) throw error;

      toast({
        title: "Subscription canceled",
        description: `Your subscription will end on ${new Date(data.endsAt).toLocaleDateString()}`,
      });

      setShowCancelModal(false);
      loadBillingData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setCancelConfirm(false);
    }
  };

  const handleChangePlan = async (newPriceId: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-subscription-plan", {
        body: { newPriceId }
      });
      
      if (error) throw error;

      toast({
        title: "Plan updated",
        description: "Your subscription has been updated successfully",
      });

      setShowUpgradeModal(false);
      loadBillingData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!businessInfo) return null;

  const currentPlan = PLAN_CONFIG[businessInfo.selected_plan as keyof typeof PLAN_CONFIG];
  const minutesUsed = 0; // TODO: Calculate from calls table
  const usagePercent = (minutesUsed / currentPlan.minutes) * 100;
  const overageMinutes = Math.max(0, minutesUsed - currentPlan.minutes);
  const overageCharges = overageMinutes * currentPlan.overageRate;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      active: { variant: "default", text: "Active" },
      trialing: { variant: "secondary", text: "Trial" },
      canceled: { variant: "destructive", text: "Canceled" },
      past_due: { variant: "outline", text: "Past Due" },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>

        <h1 className="text-4xl font-bold mb-8">Billing & Subscription</h1>

        <div className="grid gap-6 max-w-5xl">
          {/* Current Plan */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Plan</CardTitle>
                {subscriptionData?.status && getStatusBadge(subscriptionData.status)}
              </div>
              <CardDescription>Manage your subscription and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                  <p className="text-3xl font-bold text-primary mt-2">${currentPlan.price}/month</p>
                </div>
              </div>

              {businessInfo.trial_ends_at && subscriptionData?.status === "trialing" && (
                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    Your trial ends on <strong>{new Date(businessInfo.trial_ends_at).toLocaleDateString()}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You'll be charged ${currentPlan.price} on {new Date(businessInfo.trial_ends_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {subscriptionData?.subscription_end && subscriptionData?.status === "active" && (
                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    Next billing date: <strong>{new Date(subscriptionData.subscription_end).toLocaleDateString()}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Next charge: ${currentPlan.price}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{currentPlan.minutes} minutes included per month</span>
                  <span className="font-medium">${currentPlan.overageRate}/min overage</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current usage:</span>
                    <span className="font-medium">{minutesUsed} of {currentPlan.minutes} minutes</span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                </div>
              </div>

              <div className="flex gap-3">
                {businessInfo.selected_plan !== "business" && (
                  <Button onClick={() => setShowUpgradeModal(true)} className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowUpgradeModal(true)} className="flex-1">
                  Change Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethod ? (
                <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">{paymentMethod.brand}</p>
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• {paymentMethod.last4}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-secondary/30 rounded-lg p-4 text-center text-muted-foreground">
                  No payment method on file
                </div>
              )}

              <Button variant="outline" onClick={handleUpdatePaymentMethod} disabled={actionLoading} className="w-full">
                {paymentMethod ? "Update" : "Add"} Payment Method
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Powered by Stripe</span>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === "paid" ? "default" : "outline"}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.invoiceUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No billing history yet</p>
                  <p className="text-sm mt-2">Your first invoice will appear here after your trial ends</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage This Month */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Usage This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Minutes</p>
                  <p className="text-2xl font-bold">{minutesUsed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Included</p>
                  <p className="text-2xl font-bold">{currentPlan.minutes}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Overage</p>
                  <p className="text-2xl font-bold text-primary">{overageMinutes}</p>
                </div>
              </div>

              {overageMinutes > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Overage Charges</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You've used {overageMinutes} additional minutes this month
                      </p>
                      <p className="text-sm font-medium mt-2">
                        Additional charges: ${overageCharges.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Will be billed on {subscriptionData?.subscription_end && new Date(subscriptionData.subscription_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-elegant border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Cancel Subscription
              </CardTitle>
              <CardDescription>
                Cancel your subscription and stop all future charges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setShowCancelModal(true)} className="text-destructive border-destructive hover:bg-destructive hover:text-white">
                Cancel Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                You'll lose access to AI Voicemail at the end of your billing period
                {subscriptionData?.subscription_end && ` (${new Date(subscriptionData.subscription_end).toLocaleDateString()})`}
              </p>
              <p>Your data will be kept for 30 days in case you change your mind</p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Checkbox 
              id="cancel-confirm" 
              checked={cancelConfirm}
              onCheckedChange={(checked) => setCancelConfirm(checked as boolean)}
            />
            <label htmlFor="cancel-confirm" className="text-sm cursor-pointer">
              I understand I'll lose access to my AI voicemail
            </label>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setShowCancelModal(false);
              setCancelConfirm(false);
            }}>
              Never mind
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={!cancelConfirm || actionLoading}
            >
              {actionLoading ? "Canceling..." : "Yes, Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade/Change Plan Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Change Your Plan</DialogTitle>
            <DialogDescription>
              Upgrades apply immediately with prorated charges. Downgrades take effect at the end of your billing period.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-4 py-4">
            {Object.entries(PLAN_CONFIG).map(([key, plan]) => {
              const isCurrent = key === businessInfo.selected_plan;
              return (
                <Card key={key} className={isCurrent ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-2xl font-bold">${plan.price}/mo</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <p>✓ {plan.minutes} minutes/month</p>
                      <p>✓ ${plan.overageRate}/min overage</p>
                      <p>✓ Email & SMS alerts</p>
                      <p>✓ Call analytics</p>
                    </div>
                    <Button 
                      onClick={() => handleChangePlan(plan.priceId)}
                      disabled={isCurrent || actionLoading}
                      className="w-full"
                      variant={isCurrent ? "outline" : "default"}
                    >
                      {isCurrent ? "Current Plan" : actionLoading ? "Updating..." : `Switch to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
