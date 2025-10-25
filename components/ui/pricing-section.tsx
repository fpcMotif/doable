'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FloatingCard, GradientText } from '@/components/ui/animated-components';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingItem {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  isPopular?: boolean;
}

interface PricingSectionProps {
  title: string;
  subtitle: string;
  items: PricingItem[];
}

export function PricingSection({ title, subtitle, items }: PricingSectionProps) {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-6">
            <GradientText>{title}</GradientText>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.map((item, index) => (
            <FloatingCard
              key={index}
              delay={index * 0.1}
              className="group"
            >
              <div className={cn(
                "relative p-8 rounded-2xl border transition-all duration-300 h-full",
                item.isPopular 
                  ? "border-primary bg-card shadow-lg shadow-primary/10" 
                  : "border-border bg-card/50 backdrop-blur-sm hover:bg-card/80"
              )}>
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
                        <Check className="h-3 w-3 text-green-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={cn(
                    "w-full py-3 font-medium transition-all duration-300",
                    item.isPopular
                      ? "bg-primary hover:bg-primary/90 hover:scale-105"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
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
              </div>
            </FloatingCard>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm font-medium text-muted-foreground">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>All plans include full access to source code</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
