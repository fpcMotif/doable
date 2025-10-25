import { stackServerApp } from "@/stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Star, Globe, Users, Zap, Shield, Code, ComponentIcon } from "lucide-react";

export default async function IndexPage() {
  const project = await stackServerApp.getProject();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-3xl opacity-30" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Capsule Badge */}
            <div className="mb-8">
              <a
                href="https://github.com/stack-auth/stack-template"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Star className="h-4 w-4" />
                100% Open-source & Free
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                The Modern Task Management Platform
              </h1>
            </div>

            {/* Subtitle */}
            <div className="mb-12">
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Built for teams who want to get things done. Clean, fast, and powerful task management with Swiss design principles.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                className="group px-8 py-4 text-lg font-medium bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                asChild
              >
                <a href={stackServerApp.urls.signUp}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium hover:bg-secondary transition-all duration-300"
                asChild
              >
                <a href="https://github.com/stack-auth/stack-template">
                  View on GitHub
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Open source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* Credits */}
            <div className="mt-16 text-sm text-muted-foreground">
              Crafted with ❤️ by{" "}
              <a
                href="https://stack-auth.com"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                Stack Auth
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Everything you need to manage tasks
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed with Swiss design principles for maximum clarity and efficiency.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Modern Interface",
                description: "Clean, intuitive design inspired by Swiss design principles. Every pixel serves a purpose.",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Team Collaboration",
                description: "Built-in team management with role-based permissions. Work together seamlessly.",
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Lightning Fast",
                description: "Built with Next.js 14 and optimized for performance. Experience the speed difference.",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with Stack Auth. Your data is always protected.",
              },
              {
                icon: <Code className="h-8 w-8" />,
                title: "Open Source",
                description: "Full source code available. Customize, extend, and contribute to the project.",
              },
              {
                icon: <ComponentIcon className="h-8 w-8" />,
                title: "Modular Design",
                description: "Clean architecture with reusable components. No spaghetti code, just clean solutions.",
              },
            ].map((item, index) => (
              <Card key={index} className="group relative p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm font-medium text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>All features included in the free plan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Simple, transparent pricing
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Free",
                price: "Free",
                description: "Perfect for individuals and small teams getting started.",
                features: [
                  "Unlimited projects and tasks",
                  "Up to 5 team members",
                  "Basic integrations",
                  "Community support",
                  "Full source code access",
                ],
                buttonText: "Get Started",
                buttonHref: stackServerApp.urls.signUp,
              },
              {
                title: "Pro",
                price: "$9",
                description: "Ideal for growing teams that need advanced features.",
                features: [
                  "Everything in Free",
                  "Unlimited team members",
                  "Advanced analytics",
                  "Priority support",
                  "Custom integrations",
                  "Advanced permissions",
                ],
                buttonText: "Upgrade to Pro",
                buttonHref: stackServerApp.urls.signUp,
                isPopular: true,
              },
              {
                title: "Enterprise",
                price: "Custom",
                description: "For large organizations with specific needs.",
                features: [
                  "Everything in Pro",
                  "Dedicated support",
                  "Custom deployment",
                  "SLA guarantee",
                  "Advanced security",
                  "Custom integrations",
                ],
                buttonText: "Contact Sales",
                buttonHref: stackServerApp.urls.signUp,
              },
            ].map((item, index) => (
              <Card 
                key={index} 
                className={`relative p-8 rounded-2xl border transition-all duration-300 h-full ${
                  item.isPopular 
                    ? "border-primary bg-card shadow-lg shadow-primary/10" 
                    : "border-border bg-card/50 backdrop-blur-sm hover:bg-card/80"
                }`}
              >
                {/* Popular Badge */}
                {item.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">
                    {item.title}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-light text-foreground">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {item.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full py-3 font-medium transition-all duration-300 ${
                    item.isPopular
                      ? "bg-primary hover:bg-primary/90 hover:scale-105"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  asChild
                >
                  <a href={item.buttonHref}>
                    {item.buttonText}
                  </a>
                </Button>

                {/* Hover Effect */}
                {!item.isPopular && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}
              </Card>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm font-medium text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>All plans include full access to source code</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}