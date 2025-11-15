import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const step1Schema = z.object({
  businessName: z.string().trim().min(1, { message: "Business name is required" }).max(100),
  ownerName: z.string().trim().min(1, { message: "Your name is required" }).max(100),
  businessPhone: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .pipe(z.string().regex(/^[1-9]\d{9,14}$/, "Phone must be 10-15 digits")),
});

const step2Schema = z.object({
  industry: z.string().min(1, { message: "Please select an industry" }),
  serviceArea: z.string().trim().min(1, { message: "Service area is required" }).max(100),
  servicesOffered: z.array(z.string()).min(1, { message: "Select at least one service" }),
});

const step3Schema = z.object({
  notificationPhone: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .pipe(z.string().regex(/^[1-9]\d{9,14}$/, "Phone must be 10-15 digits")),
  notificationEmail: z.string().trim().email({ message: "Valid email is required" }),
});

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

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  
  // Step 1 data
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  
  // Step 2 data
  const [industry, setIndustry] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  
  // Step 3 data
  const [notificationPhone, setNotificationPhone] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signin");
        return;
      }
      setUserEmail(session.user.email || "");
      setUserId(session.user.id);
      setNotificationEmail(session.user.email || "");
      
      // Get selected plan from session storage or user metadata
      const plan = sessionStorage.getItem("selected_plan") || session.user.user_metadata?.selected_plan || "professional";
      setSelectedPlan(plan);
    });
  }, [navigate]);

  const handleServiceToggle = (serviceId: string) => {
    setServicesOffered(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const validateStep1 = () => {
    const result = step1Schema.safeParse({ businessName, ownerName, businessPhone });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const result = step2Schema.safeParse({ industry, serviceArea, servicesOffered });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep3 = () => {
    const result = step3Schema.safeParse({ notificationPhone, notificationEmail });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      // Pre-fill notification phone with business phone
      if (!notificationPhone) {
        setNotificationPhone(businessPhone);
      }
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // Convert phone numbers to E.164 format for database
      const cleanBusinessPhone = businessPhone.replace(/\D/g, '');
      const cleanNotificationPhone = notificationPhone.replace(/\D/g, '');
      const e164BusinessPhone = cleanBusinessPhone.startsWith('1') ? `+${cleanBusinessPhone}` : `+1${cleanBusinessPhone}`;
      const e164NotificationPhone = cleanNotificationPhone.startsWith('1') ? `+${cleanNotificationPhone}` : `+1${cleanNotificationPhone}`;
      
      const { error } = await supabase
        .from("businesses")
        .insert({
          user_id: userId,
          business_name: businessName,
          owner_name: ownerName,
          business_phone: e164BusinessPhone,
          industry,
          service_area: serviceArea,
          services_offered: servicesOffered,
          notification_phone: e164NotificationPhone,
          notification_email: notificationEmail,
          selected_plan: selectedPlan,
        });

      if (error) {
        toast({
          title: "Error saving business information",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Clear session storage
      sessionStorage.removeItem("selected_plan");

      toast({
        title: "Business information saved!",
        description: "Proceeding to payment setup...",
      });

      // Redirect to payment
      setTimeout(() => {
        navigate("/onboarding/payment");
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

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-elegant animate-fade-up">
          <CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <span>Step {step} of 3</span>
                <span className="capitalize">{selectedPlan} Plan</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <CardTitle className="text-2xl md:text-3xl mt-4">
              {step === 1 && "Tell us about your business"}
              {step === 2 && "What services do you offer?"}
              {step === 3 && "How should we notify you?"}
            </CardTitle>
            {step === 1 && (
              <CardDescription>We'll use this to set up your AI assistant</CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {/* Step 1 - Business Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="ABC Plumbing Co."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive">{errors.businessName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Your Name *</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Smith"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                  {errors.ownerName && (
                    <p className="text-sm text-destructive">{errors.ownerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone Number *</Label>
                  <Input
                    id="businessPhone"
                    placeholder="(555) 123-4567"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                  />
                  {errors.businessPhone && (
                    <p className="text-sm text-destructive">{errors.businessPhone}</p>
                  )}
                </div>

                <Button onClick={handleNext} className="w-full" size="lg">
                  Next
                </Button>
              </div>
            )}

            {/* Step 2 - Service Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind.toLowerCase()}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-destructive">{errors.industry}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceArea">Service Area *</Label>
                  <Input
                    id="serviceArea"
                    placeholder="City, State"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                  />
                  {errors.serviceArea && (
                    <p className="text-sm text-destructive">{errors.serviceArea}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Services Offered * (select at least one)</Label>
                  <div className="space-y-3 mt-2">
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
                  {errors.servicesOffered && (
                    <p className="text-sm text-destructive">{errors.servicesOffered}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleBack} variant="outline" className="flex-1" size="lg">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1" size="lg">
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 - Notifications */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationPhone">SMS Phone Number *</Label>
                  <Input
                    id="notificationPhone"
                    placeholder="(555) 123-4567"
                    value={notificationPhone}
                    onChange={(e) => setNotificationPhone(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll send you an SMS when you receive a call
                  </p>
                  {errors.notificationPhone && (
                    <p className="text-sm text-destructive">{errors.notificationPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Email *</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    placeholder="you@company.com"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll also send a detailed email summary
                  </p>
                  {errors.notificationEmail && (
                    <p className="text-sm text-destructive">{errors.notificationEmail}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleBack} variant="outline" className="flex-1" size="lg">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Continue to Payment"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
