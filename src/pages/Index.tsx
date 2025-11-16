import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Phone, Bot, MessageSquare, Check, Menu, Smartphone } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useState } from "react";
const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pricingPlans = [{
    name: "Starter",
    badge: "Solo operators",
    price: "$35",
    period: "month",
    calls: "100 minutes/month (~33 calls)",
    features: ["AI answers calls 24/7", "Collects customer information", "Instant SMS alerts with customer details (name, phone, service, address)", "Detailed email summaries with full transcripts", "Custom AI greeting", "Business hours settings", "Basic call logs"],
    additional: "Overage: $0.50/min after 100 minutes",
    cta: "Start Free Trial",
    highlighted: false
  }, {
    name: "Professional",
    badge: "Most Popular",
    price: "$100",
    period: "month",
    calls: "300 minutes/month (~100 calls)",
    features: ["Everything in Starter", "Call recordings & transcripts", "Advanced analytics dashboard", "Priority email support", "Daily call summaries"],
    additional: "Overage: $0.40/min after 300 minutes",
    cta: "Start Free Trial",
    highlighted: true
  }, {
    name: "Business",
    badge: null,
    price: "$300",
    period: "month",
    calls: "1000 minutes/month (~333 calls)",
    features: ["Everything in Professional", "Multiple team members", "Custom service offerings", "Advanced call routing", "Dedicated support", "Custom notification preferences"],
    additional: "Overage: $0.30/min after 1000 minutes",
    cta: "Start Free Trial",
    highlighted: false
  }, {
    name: "Enterprise",
    badge: null,
    price: "Custom",
    period: null,
    calls: "Unlimited revenue capture",
    features: ["Everything in Business", "Dedicated success manager", "Train AI on your process", "99.9% uptime guarantee", "Your branding, your rules"],
    additional: null,
    cta: "Contact Sales",
    highlighted: false
  }];
  const faqs = [{
    question: "How hard is setup?",
    answer: "Incredibly easy. You dial one code (*92[your-number]#) on your phone. Takes 30 seconds. No technical skills needed. No app to download. Works with any phone carrier. If you can make a phone call, you can set this up."
  }, {
    question: "How quickly will I see results?",
    answer: "Most contractors book their first AI-captured job within 24-48 hours. The AI works 24/7, so you start capturing after-hours and weekend calls immediately—calls that used to go straight to voicemail."
  }, {
    question: "Will this actually sound professional to my customers?",
    answer: "Absolutely. The AI sounds natural and professional. Most customers don't even realize they're talking to AI. They just appreciate getting a real response instead of voicemail."
  }, {
    question: "What if I'm already using a call service?",
    answer: "Unlike traditional answering services, our AI doesn't just take messages—it actively collects job details, preferred times, and urgency levels. You get qualified leads, not just names and numbers. Plus, it works instantly when you can't answer, with no delays."
  }, {
    question: "How much revenue am I losing to missed calls right now?",
    answer: "Industry data shows contractors miss 30-40% of calls. If your average job is $500 and you get 10 calls/week, that's potentially $6,000-$8,000/month in lost revenue. Our service costs a fraction of one lost job."
  }, {
    question: "Can I try it risk-free?",
    answer: "Yes! 14-day free trial on any plan, no credit card required. If you don't capture at least one qualified lead, you shouldn't pay. That's how confident we are."
  }];
  return <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 font-bold text-xl md:text-2xl text-primary hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <span className="bg-gradient-primary bg-clip-text text-transparent">AI Voicemail</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Pricing
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                FAQ
              </a>
              <a href="/signin" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Sign In
              </a>
              <Button asChild size="lg">
                <a href="/signup">Get Started Free</a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <a href="#pricing" className="text-lg font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Pricing
                  </a>
                  <a href="#faq" className="text-lg font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    FAQ
                  </a>
                  <a href="/signin" className="text-lg font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </a>
                  <Button asChild size="lg" className="mt-4">
                    <a href="/signup">Get Started Free</a>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-sm px-4 py-2">
              ⚡ 30-Second Setup • No App Required • Works On Any Phone
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Never Miss a Customer Call Again
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              AI answers when you can't. Books appointments. Texts you details. Setup in 30 seconds - just dial a code.
            </p>
            <div className="flex flex-col gap-4">
              <Button size="lg" className="text-lg px-8 shadow-elegant hover:shadow-xl transition-all w-fit">
                <a href="/signup">Start Free 14-Day Trial</a>
              </Button>
              <p className="text-sm text-muted-foreground">
                Setup takes 30 seconds • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
          <div className="relative">
            <img src={heroImage} alt="AI Voicemail Dashboard showing captured leads and booked appointments" className="rounded-2xl shadow-elegant w-full h-auto" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          Turn Every Call Into Revenue
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Stop competing on who answers fastest. Win on who captures every opportunity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Quick Setup (30 Seconds)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-semibold mb-2">Dial one code. That's it.</p>
              <p className="text-sm text-muted-foreground">No app download. No complicated settings. Works with any carrier.</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Never Lose a Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Whether you're on a job, driving, or with family—every caller gets a professional response instantly.</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Book While You Sleep</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">AI collects all job details and preferred times. Wake up to a full schedule, not voicemails.</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Focus on Real Work</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Stop playing phone tag. Get organized lead details via text, ready to convert into paying jobs.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* See It In Action Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get customer details instantly - no phone tag
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* iPhone Mockup */}
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                {/* iPhone Frame */}
                <div className="w-[340px] h-[680px] bg-[#1c1c1e] rounded-[3.5rem] p-2 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[3rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1c1c1e] rounded-b-3xl z-10"></div>
                    
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-11 flex justify-between items-center px-8 pt-2 text-xs font-semibold z-0">
                      <span>9:41</span>
                      <div className="flex gap-1 items-center">
                        <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
                          <path d="M0 5h4v2H0V5zm6 0h4v2H6V5zm6 0h4v2h-4V5z"/>
                        </svg>
                        <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
                          <path d="M1 3l7 6 7-6H1z"/>
                        </svg>
                        <svg className="w-5 h-4" viewBox="0 0 20 16" fill="currentColor">
                          <rect x="1" y="1" width="16" height="12" rx="2" stroke="currentColor" fill="none"/>
                          <rect x="18" y="5" width="1" height="4" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Messages Header */}
                    <div className="absolute top-11 left-0 right-0 bg-[#f6f6f6] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button className="text-[#007AFF] flex items-center gap-1 text-base">
                          <span className="text-xl font-light">&lt;</span>
                          <span>Messages</span>
                        </button>
                      </div>
                      <div className="flex-1 text-center">
                        <h1 className="font-semibold text-base">AI Voicemail</h1>
                      </div>
                      <div className="flex items-center gap-4 flex-1 justify-end">
                        <Phone className="w-5 h-5 text-[#007AFF]" />
                      </div>
                    </div>
                    
                    {/* Messages Content */}
                    <div className="absolute top-[88px] bottom-0 left-0 right-0 bg-white px-4 py-6 overflow-hidden">
                      {/* Date Stamp */}
                      <div className="text-center mb-4">
                        <span className="text-xs text-gray-500">Today 9:41 AM</span>
                      </div>
                      
                      {/* iMessage Bubble */}
                      <div className="flex justify-start mb-2">
                        <div className="max-w-[280px]">
                          <div className="bg-[#007AFF] text-white rounded-3xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="space-y-2 text-[15px] leading-relaxed">
                              <p className="font-medium">🔔 New call from customer</p>
                              <p className="font-semibold">Mike Johnson</p>
                              <p>(555) 123-4567</p>
                              <div className="border-t border-white/20 my-2 pt-2">
                                <p><span className="font-medium">Service:</span> Water heater repair</p>
                                <p><span className="font-medium">Address:</span> 123 Main St, Denver</p>
                                <p><span className="font-medium">Urgency:</span> ASAP 🔴</p>
                              </div>
                              <div className="border-t border-white/20 my-2 pt-2">
                                <p><span className="font-medium">Notes:</span> Water leaking, needs help today</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 px-2">
                            Read
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* iPhone Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full"></div>
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-[#007AFF]/20 blur-3xl -z-10 rounded-full"></div>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <span className="text-2xl">⚡</span>
                  <span className="font-semibold text-primary">10 Seconds</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Customer Info Delivered Instantly
                </h3>
                <p className="text-lg text-muted-foreground">
                  You get this text in 10 seconds. Customer info delivered instantly while you're on the job.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">Every detail captured by AI</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">Ready to call back and close</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">No more missed opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16 md:py-24 bg-secondary/30">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          Pay For Results, Not Missed Opportunities
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
          One missed call costs more than a month of service. Start capturing revenue in 24 hours.
        </p>
        <p className="text-2xl font-semibold text-center mb-12 max-w-3xl mx-auto text-foreground">
          Never miss a customer again. AI answers, collects info, texts you the details - all in seconds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map(plan => <Card key={plan.name} className={`flex flex-col ${plan.highlighted ? 'border-primary border-2 shadow-elegant scale-105 lg:scale-110' : 'border-2'} transition-all hover:shadow-elegant`}>
              <CardHeader>
                {plan.badge && <Badge className="w-fit mb-2" variant={plan.highlighted ? "default" : "secondary"}>
                    {plan.badge}
                  </Badge>}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground mt-2">
                  {plan.price}
                  {plan.period && <span className="text-base font-normal text-muted-foreground">/{plan.period}</span>}
                </CardDescription>
                <p className="text-sm text-muted-foreground">{plan.calls}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map(feature => <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>)}
                </ul>
                {plan.additional && <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                    {plan.additional}
                  </p>}
              </CardContent>
              <CardFooter>
                <a href={plan.name === "Enterprise" ? "mailto:sales@aivoicemail.com" : `/signup?plan=${plan.name.toLowerCase()}`} className="w-full">
                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} size="lg">
                    {plan.cta}
                  </Button>
                </a>
              </CardFooter>
            </Card>)}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-12 max-w-4xl mx-auto">
          All plans include: Dedicated phone number • 30-second setup • SMS & email notifications • No contracts • Cancel anytime
        </p>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left side - Visual */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    About AI Voicemail
                  </h2>
                  <div className="h-1 w-20 bg-primary rounded-full"></div>
                </div>
              </div>
              
              {/* Right side - Content */}
              <CardContent className="p-8 md:p-12 flex flex-col justify-center bg-card">
                <div className="space-y-6">
                  <p className="text-lg text-foreground leading-relaxed">
                    Built by <span className="font-semibold text-primary">Alex</span>, a 24-year-old entrepreneur who saw small service businesses losing thousands to missed calls.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    After talking to <span className="font-semibold text-foreground">1,000+ plumbers, HVAC contractors, and roofers</span>, one thing was clear: you're too busy working to answer every call.
                  </p>
                  <p className="text-lg text-foreground leading-relaxed font-medium">
                    That's where AI Voicemail comes in.
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 AI Voicemail
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;