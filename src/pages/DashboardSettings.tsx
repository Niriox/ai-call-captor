import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Phone, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const industries = [
  "Plumbing",
  "HVAC",
  "Roofing",
  "Electrical",
  "Landscaping",
  "General Contractor",
  "Other",
];

const serviceOptions = [
  { id: "emergency", label: "Emergency/24-7 service" },
  { id: "repairs", label: "Repairs" },
  { id: "installations", label: "Installations" },
  { id: "maintenance", label: "Maintenance" },
  { id: "inspections", label: "Inspections" },
  { id: "other", label: "Other" },
];

const businessInfoSchema = z.object({
  businessName: z.string().trim().min(1).max(100),
  ownerName: z.string().trim().min(1).max(100),
  businessPhone: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .pipe(z.string().regex(/^[1-9]\d{9,14}$/, "Phone must be 10-15 digits")),
  industry: z.string().min(1),
  serviceArea: z.string().trim().min(1).max(100),
  servicesOffered: z.array(z.string()).min(1),
});

const DashboardSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [businessDisplayName, setBusinessDisplayName] = useState("");
  
  // Business Info
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  
  // AI Configuration
  const [businessHours, setBusinessHours] = useState("24/7");
  const [customGreeting, setCustomGreeting] = useState("");
  
  // Notifications
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsPhone, setSmsPhone] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [includeTranscripts, setIncludeTranscripts] = useState(false);
  const [sendDailySummary, setSendDailySummary] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/signin");
        return;
      }

      setUserId(session.user.id);
      setUserEmail(session.user.email || "");

      // Fetch business data
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error loading settings",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data) {
        navigate("/onboarding");
        return;
      }

      // Populate form fields
      setBusinessName(data.business_name);
      setOwnerName(data.owner_name);
      setBusinessPhone(data.business_phone);
      setIndustry(data.industry);
      setServiceArea(data.service_area);
      setServicesOffered(data.services_offered || []);
      setSmsPhone(data.notification_phone);
      setNotificationEmail(data.notification_email);
      setBusinessDisplayName(data.business_name);
      
      // Set default greeting
      setCustomGreeting(`Hi, thanks for calling ${data.business_name}. I'm here to help. What can I assist you with today?`);
      
      setIsLoading(false);
    };

    loadSettings();
  }, [navigate, toast]);

  const handleServiceToggle = (serviceId: string) => {
    setServicesOffered(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSaveBusinessInfo = async () => {
    const result = businessInfoSchema.safeParse({
      businessName,
      ownerName,
      businessPhone,
      industry,
      serviceArea,
      servicesOffered,
    });

    if (!result.success) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Convert phone to E.164 format for database
      const cleanBusinessPhone = businessPhone.replace(/\D/g, '');
      const e164BusinessPhone = cleanBusinessPhone.startsWith('1') ? `+${cleanBusinessPhone}` : `+1${cleanBusinessPhone}`;
      
      const { error } = await supabase
        .from("businesses")
        .update({
          business_name: businessName,
          owner_name: ownerName,
          business_phone: e164BusinessPhone,
          industry,
          service_area: serviceArea,
          services_offered: servicesOffered,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Business information updated successfully",
      });
      setBusinessDisplayName(businessName);
    } catch (error: any) {
      toast({
        title: "Error saving changes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);

    try {
      // Convert notification phone to E.164 format for database
      const cleanSmsPhone = smsPhone.replace(/\D/g, '');
      const e164SmsPhone = cleanSmsPhone.startsWith('1') ? `+${cleanSmsPhone}` : `+1${cleanSmsPhone}`;
      
      const { error } = await supabase
        .from("businesses")
        .update({
          notification_phone: e164SmsPhone,
          notification_email: notificationEmail,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Notification settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error saving changes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAIConfig = () => {
    toast({
      title: "Success!",
      description: "AI configuration saved successfully",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const handleDeleteAccount = async () => {
    // This would require backend implementation
    toast({
      title: "Feature not implemented",
      description: "Please contact support to delete your account",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Top Navigation */}
      <nav className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Phone className="w-6 h-6" />
              AI Voicemail
            </a>

            <div className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="/dashboard/settings" className="text-foreground font-medium hover:text-primary transition-colors">
                Settings
              </a>
              <a href="/billing" className="text-muted-foreground hover:text-primary transition-colors">
                Billing
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {businessDisplayName}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{businessDisplayName}</p>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="business-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="business-info">Business Info</TabsTrigger>
            <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Business Info Tab */}
          <TabsContent value="business-info">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Update your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone Number *</Label>
                    <Input
                      id="businessPhone"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind.toLowerCase()}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceArea">Service Area *</Label>
                  <Input
                    id="serviceArea"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="City, State"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Services Offered *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {serviceOptions.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={service.id}
                          checked={servicesOffered.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <label
                          htmlFor={service.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {service.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveBusinessInfo} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Configuration Tab */}
          <TabsContent value="ai-config">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Customize your AI assistant behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Business Hours</Label>
                  <p className="text-sm text-muted-foreground">When should AI answer calls?</p>
                  <RadioGroup value={businessHours} onValueChange={setBusinessHours}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="24/7" id="24-7" />
                      <Label htmlFor="24-7" className="cursor-pointer">24/7 (always on)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business-hours" id="business-hours" />
                      <Label htmlFor="business-hours" className="cursor-pointer">Business hours only</Label>
                    </div>
                  </RadioGroup>

                  {businessHours === "business-hours" && (
                    <div className="ml-6 mt-4 space-y-3 p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Monday - Friday</Label>
                          <div className="flex items-center gap-2">
                            <Input type="time" defaultValue="09:00" className="w-full" />
                            <span className="text-sm text-muted-foreground">to</span>
                            <Input type="time" defaultValue="17:00" className="w-full" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Weekend Coverage</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="saturday" />
                            <label htmlFor="saturday" className="text-sm cursor-pointer">
                              Saturday
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="sunday" />
                            <label htmlFor="sunday" className="text-sm cursor-pointer">
                              Sunday
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="greeting">Custom Greeting</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Customize what the AI says when answering
                    </p>
                  </div>
                  <Textarea
                    id="greeting"
                    value={customGreeting}
                    onChange={(e) => setCustomGreeting(e.target.value.slice(0, 200))}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {customGreeting.length}/200
                  </p>
                </div>

                <Button onClick={handleSaveAIConfig} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive call notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive text messages when calls come in
                      </p>
                    </div>
                    <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                  </div>

                  {smsEnabled && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="smsPhone">Phone Number</Label>
                      <Input
                        id="smsPhone"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive detailed call summaries via email
                      </p>
                    </div>
                    <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                  </div>

                  {emailEnabled && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="notificationEmail">Email Address</Label>
                        <Input
                          id="notificationEmail"
                          type="email"
                          value={notificationEmail}
                          onChange={(e) => setNotificationEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transcripts"
                            checked={includeTranscripts}
                            onCheckedChange={(checked) => setIncludeTranscripts(checked as boolean)}
                          />
                          <label htmlFor="transcripts" className="text-sm cursor-pointer">
                            Include call transcripts
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="dailySummary"
                            checked={sendDailySummary}
                            onCheckedChange={(checked) => setSendDailySummary(checked as boolean)}
                          />
                          <label htmlFor="dailySummary" className="text-sm cursor-pointer">
                            Send daily summary
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Email</Label>
                    <p className="text-sm">{userEmail}</p>
                  </div>
                  <Button variant="outline" disabled>
                    Change Email (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" disabled>
                    Change Password (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Deleting your account is permanent and cannot be undone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardSettings;
