import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  Infinity, 
  Headset, 
  Settings, 
  Shield, 
  Users, 
  Tag,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const enterpriseSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").refine(
    (email) => {
      const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const domain = email.split('@')[1];
      return !personalDomains.includes(domain);
    },
    "Please use a business email address"
  ),
  phone: z.string().min(10, "Phone number is required"),
  companyName: z.string().min(1, "Company name is required"),
  numLocations: z.string().min(1, "Please select number of locations"),
  estimatedCalls: z.string().min(1, "Please select estimated calls"),
  agreeToContact: z.boolean().refine(val => val === true, "You must agree to be contacted"),
});

const Enterprise = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    numLocations: "",
    estimatedCalls: "",
    currentSolution: "",
    message: "",
    agreeToContact: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = enterpriseSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Insert into database
      const { error: dbError } = await supabase
        .from("enterprise_inquiries")
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.companyName,
          num_locations: formData.numLocations,
          estimated_calls: formData.estimatedCalls,
          current_solution: formData.currentSolution || null,
          message: formData.message || null,
        });

      if (dbError) throw dbError;

      // Send notification email (optional - requires Resend setup)
      try {
        await supabase.functions.invoke("send-enterprise-notification", {
          body: formData,
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the whole submission if email fails
      }

      setSubmitted(true);
      toast({
        title: "Request submitted!",
        description: "We'll contact you within 24 hours",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-elegant">
              <CardContent className="pt-12 pb-12">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Thanks for your interest!</h2>
                <p className="text-lg text-muted-foreground mb-3">
                  We've received your information and will contact you within 24 hours
                </p>
                <p className="text-muted-foreground mb-8">
                  In the meantime, check your email for some resources about our Enterprise plan
                </p>
                <Button size="lg" onClick={() => navigate("/")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Infinity,
      title: "Unlimited Calls",
      description: "No limits on call volume or minutes",
    },
    {
      icon: Headset,
      title: "Dedicated Support",
      description: "Priority support with a dedicated account manager",
    },
    {
      icon: Settings,
      title: "Custom Integrations",
      description: "Connect with your existing CRM and tools",
    },
    {
      icon: Shield,
      title: "SLA Guarantee",
      description: "99.9% uptime with guaranteed response times",
    },
    {
      icon: Users,
      title: "Multi-Location Support",
      description: "Manage multiple locations from one dashboard",
    },
    {
      icon: Tag,
      title: "White-Label Options",
      description: "Brand the experience as your own",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Enterprise Plan</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Custom solutions for larger organizations
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get unlimited calls, dedicated support, and custom integrations tailored to your business
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-elegant">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Get in Touch</CardTitle>
              <CardDescription className="text-lg">
                Fill out the form and our team will contact you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={loading}
                    />
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={loading}
                    />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={loading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    maxLength={14}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Plumbing Co."
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    disabled={loading}
                  />
                  {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numLocations">Number of Locations *</Label>
                  <Select 
                    value={formData.numLocations}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, numLocations: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5</SelectItem>
                      <SelectItem value="6-10">6-10</SelectItem>
                      <SelectItem value="11-25">11-25</SelectItem>
                      <SelectItem value="26-50">26-50</SelectItem>
                      <SelectItem value="51-100">51-100</SelectItem>
                      <SelectItem value="100+">100+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.numLocations && <p className="text-sm text-destructive">{errors.numLocations}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCalls">Estimated Monthly Calls *</Label>
                  <Select
                    value={formData.estimatedCalls}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedCalls: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<500">Less than 500</SelectItem>
                      <SelectItem value="500-1000">500-1,000</SelectItem>
                      <SelectItem value="1000-2500">1,000-2,500</SelectItem>
                      <SelectItem value="2500-5000">2,500-5,000</SelectItem>
                      <SelectItem value="5000-10000">5,000-10,000</SelectItem>
                      <SelectItem value="10000+">10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.estimatedCalls && <p className="text-sm text-destructive">{errors.estimatedCalls}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSolution">Current Solution</Label>
                  <Select
                    value={formData.currentSolution}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currentSolution: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No current solution</SelectItem>
                      <SelectItem value="receptionist">Human receptionist</SelectItem>
                      <SelectItem value="answering-service">Answering service</SelectItem>
                      <SelectItem value="ai">Different AI solution</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell us about your needs</Label>
                  <Textarea
                    id="message"
                    placeholder="What challenges are you trying to solve?"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="agree"
                    checked={formData.agreeToContact}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToContact: checked as boolean }))}
                    disabled={loading}
                  />
                  <label htmlFor="agree" className="text-sm cursor-pointer">
                    I agree to be contacted by AI Voicemail about this inquiry *
                  </label>
                </div>
                {errors.agreeToContact && <p className="text-sm text-destructive">{errors.agreeToContact}</p>}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Request Enterprise Quote"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trusted by Leading Service Businesses
          </h2>
          
          <Card className="max-w-3xl mx-auto shadow-elegant">
            <CardContent className="pt-8 pb-8">
              <p className="text-xl italic text-center mb-6">
                "AI Voicemail helped us scale from 5 to 50 locations without adding phone staff"
              </p>
              <div className="text-center">
                <p className="font-semibold">John Smith</p>
                <p className="text-sm text-muted-foreground">Operations Director, Smith HVAC Services</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Enterprise;
