import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Phone, Bot, MessageSquare, Check } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const pricingPlans = [
    {
      name: "Starter",
      badge: "Best for small teams",
      price: "$35",
      period: "month",
      calls: "~15-20 calls included",
      features: [
        "AI phone answering",
        "SMS notifications",
        "Email summaries",
        "Basic support",
      ],
      additional: "$1.50/min after included minutes",
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Professional",
      badge: "Most Popular",
      price: "$100",
      period: "month",
      calls: "~50-60 calls included",
      features: [
        "Everything in Starter",
        "Calendar integration",
        "Custom AI greeting",
        "Priority support",
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
      calls: "~200-250 calls included",
      features: [
        "Everything in Professional",
        "Multiple phone numbers",
        "Advanced analytics",
        "Custom integrations",
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
      calls: "Unlimited calls",
      features: [
        "Everything in Business",
        "Dedicated account manager",
        "Custom AI training",
        "SLA guarantee",
        "White-label options",
      ],
      additional: null,
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "How does it work?",
      answer: "When a call comes in, your phone rings first. If you don't pick up within 5 seconds, our AI automatically answers, collects customer information, and texts you the details.",
    },
    {
      question: "Will customers know it's AI?",
      answer: "The AI sounds completely natural. Most customers don't realize they're talking to AI.",
    },
    {
      question: "What information does the AI collect?",
      answer: "Customer name, phone number, service needed, address, and preferred appointment time.",
    },
    {
      question: "Can I try it free?",
      answer: "Yes! 14-day free trial on any plan, no credit card required to start.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change plans anytime from your dashboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Stop Losing Customers to Voicemail
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              AI Voicemail answers when you can't. Books appointments automatically. Sounds completely human.
            </p>
            <Button size="lg" className="text-lg px-8 shadow-elegant hover:shadow-xl transition-all">
              <a href="/signup">Start Free 14-Day Trial</a>
            </Button>
          </div>
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Professional contractor using AI Voicemail service" 
              className="rounded-2xl shadow-elegant w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Customer Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your business phone rings like normal</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">AI Picks Up in 5 Seconds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">If you don't answer, AI automatically takes the call</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Get Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receive SMS with name, phone, service needed, and address</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-secondary/30">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          Simple, Transparent Pricing
        </h2>
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
      <section className="container mx-auto px-4 py-16 md:py-24">
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

      {/* Footer */}
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
