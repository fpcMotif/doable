"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Ripple } from "@/components/ui/ripple";
import { TextAnimate } from "@/components/ui/text-animate";

type CtaSectionProps = {
  className?: string;
};

export const CtaSection: React.FC<CtaSectionProps> = ({ className = "" }) => {
  return (
    <div
      className={`py-16 md:py-24 lg:py-32 relative overflow-hidden ${className}`}
    >
      {/* Dot Pattern Background - Square Container */}
      <div className="absolute inset-0 flex items-center justify-center z-0"></div>

      {/* Ripple Effect Background */}
      <div className="absolute inset-0 z-0">
        <Ripple
          className="opacity-100"
          mainCircleOpacity={0.3}
          mainCircleSize={200}
          numCircles={6}
        />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-3xl opacity-30 z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Big Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-6 sm:mb-8">
          <TextAnimate
            animation="blurInUp"
            by="word"
            className="inline text-primary"
            delay={0.1}
            duration={0.8}
          >
            Ready to get things done?
          </TextAnimate>
        </h1>

        {/* Subtitle */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-center text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto px-4 leading-relaxed">
          <TextAnimate
            animation="fadeIn"
            by="word"
            className="inline"
            delay={0.5}
            duration={0.6}
          >
            Join thousands of teams already using Doable to manage their tasks
            and boost productivity.
          </TextAnimate>
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
          <Button
            asChild
            className="group px-8 py-4 text-lg font-medium bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
            size="lg"
          >
            <Link href="/dashboard">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
