import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Phone, Bot, MessageSquare, Check, Menu } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useState } from "react";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pricingPlans = [
    {
      name: "Starter",
      badge: "Solo operators",
      price: "$35",
      period: "month",
      calls: "~15-20 calls captured/mo",
      features: [
        "Capture every after-hours lead",
        "Instant SMS lead summaries",
        "Never miss emergency calls",
        "Professional AI greeting",
      ],
      additional: "$1.50/min after included minutes",
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Professional",
      badge: "Most Popular - Grow faster",
      price: "$100",
      period: "month",
      calls: "~50-60 calls captured/mo",
      features: [
        "Everything in Starter",
        "Auto-book appointments 24/7",
        "Custom AI for your business",
        "Convert leads while on jobs",
      ],
      additional: "$1.00/min after included minutes",
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Business",
      badge: null,
      price: "$300",
      period: "month",
      calls: "~200-250 calls captured/mo",
      features: [
        "Everything in Professional",
        "Multiple locations/numbers",
        "Track ROI with analytics",
        "Integrate with your tools",
      ],
      additional: "$0.75/min after included minutes",
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Enterprise",
      badge: null,
      price: "Custom",
      period: null,
      calls: "Unlimited revenue capture",
      features: [
        "Everything in Business",
        "Dedicated success manager",
        "Train AI on your process",
        "99.9% uptime guarantee",
        "Your branding, your rules",
      ],
      additional: null,
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "How quickly will I see results?",
      answer: "Most contractors book their first AI-captured job within 24-48 hours. The AI works 24/7, so you start capturing after-hours and weekend calls immediately—calls that used to go straight to voicemail.",
    },
    {
      question: "Will this actually sound professional to my customers?",
      answer: "Absolutely. The AI sounds natural and professional. Most customers don't even realize they're talking to AI. They just appreciate getting a real response instead of voicemail.",
    },
    {
      question: "What if I'm already using a call service?",
      answer: "Unlike traditional answering services, our AI doesn't just take messages—it actively collects job details, preferred times, and urgency level. You get qualified leads, not just names and numbers. Plus it works instantly when you can't answer, no delays.",
    },
    {
      question: "How much revenue am I losing to missed calls right now?",
      answer: "Industry data shows contractors miss 30-40% of calls. If your average job is $500 and you get 10 calls/week, that's potentially $6,000-$8,000/month in lost revenue. Our service costs a fraction of one lost job.",
    },
    {
      question: "Can I try it risk-free?",
      answer: "Yes! 14-day free trial on any plan, no credit card required. If you don't capture at least one qualified lead, you shouldn't pay. That's how confident we are.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
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
                  <a 
                    href="#pricing" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                  <a 
                    href="#faq" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQ
                  </a>
                  <a 
                    href="/signin" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Capture Every Lead, Even When You're Busy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Stop losing $1,000s in missed calls. Our AI converts after-hours calls into booked appointments while you sleep. Built for plumbers, HVAC contractors, and roofers who refuse to leave money on the table.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 shadow-elegant hover:shadow-xl transition-all">
                <a href="/signup">Start Free Trial</a>
              </Button>
              <p className="text-sm text-muted-foreground self-center">
                14-day trial • No credit card • Book your first job in 24 hours
              </p>
            </div>
          </div>
          <div className="relative">
            <img 
              src={heroImage} 
              alt="AI Voicemail Dashboard showing captured leads and booked appointments" 
              className="rounded-2xl shadow-elegant w-full h-auto"
            />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Never Lose a Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Whether you're on a job, driving, or with family—every caller gets a professional response instantly</p>
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
              <p className="text-muted-foreground">AI collects all job details and preferred times. Wake up to a full schedule, not voicemails</p>
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
              <p className="text-muted-foreground">Stop playing phone tag. Get organized lead details via text, ready to convert into paying jobs</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16 md:py-24 bg-secondary/30">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          Pay For Results, Not Missed Opportunities
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          One missed call costs more than a month of service. Start capturing revenue in 24 hours.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col ${plan.highlighted ? 'border-primary border-2 shadow-elegant scale-105 lg:scale-110' : 'border-2'} transition-all hover:shadow-elegant`}
            >
              <CardHeader>
                {plan.badge && (
                  <Badge className="w-fit mb-2" variant={plan.highlighted ? "default" : "secondary"}>
                    {plan.badge}
                  </Badge>
                )}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground mt-2">
                  {plan.price}
                  {plan.period && <span className="text-base font-normal text-muted-foreground">/{plan.period}</span>}
                </CardDescription>
                <p className="text-sm text-muted-foreground">{plan.calls}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.additional && (
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                    {plan.additional}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <a href={plan.name === "Enterprise" ? "mailto:sales@aivoicemail.com" : `/signup?plan=${plan.name.toLowerCase()}`} className="w-full">
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
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
    </div>
  );
};

export default Index;
