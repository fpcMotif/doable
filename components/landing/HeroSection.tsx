"use client";
import { ArrowRight } from "lucide-react";
import type React from "react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { TextAnimate } from "@/components/ui/text-animate";

type HeroSectionProps = {
  tagline?: string;
  title: string;
  highlightText?: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  className?: string;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  tagline = "Finally, a task manager that doesn't suck.",
  title = "Modern Team Task Management",
  highlightText = "Modern",
  description = "Built for teams who want to get things done. Clean, fast, and powerful task management with Swiss design principles.",
  primaryButtonText = "Get Started Free",
  primaryButtonHref = "/dashboard",
  secondaryButtonText: _secondaryButtonText = "View on GitHub",
  secondaryButtonHref:
    _secondaryButtonHref = "https://github.com/KartikLabhshetwar/doable",
  className = "",
}) => {
  return (
    <div
      className={`min-h-[calc(100vh-10rem)] w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-4 pt-20 pb-10 md:pt-32 md:pb-20 relative overflow-hidden ${className}`}
    >
      {/* Dot Pattern Background */}
      <DotPattern
        className="opacity-70 text-gray-300"
        cr={1}
        glow={true}
        height={24}
        width={24}
      />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 text-center">
        {/* Tagline */}
        {tagline && (
          <div className="mb-8">
            <AnimatedShinyText>{tagline}</AnimatedShinyText>
          </div>
        )}

        {/* Main Title */}
        <h1 className="text-center text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-6xl mb-6">
          {title
            .split(" ")
            .map((word, index) => {
              if (
                highlightText &&
                word.toLowerCase() === highlightText.toLowerCase()
              ) {
                return (
                  <span className="relative inline-block" key={index}>
                    <TextAnimate
                      animation="blurInUp"
                      by="character"
                      className="inline text-primary"
                      delay={0.2 + index * 0.1}
                      duration={0.4}
                    >
                      {word}
                    </TextAnimate>
                  </span>
                );
              }
              return (
                <TextAnimate
                  animation="blurInUp"
                  by="character"
                  className="inline"
                  delay={0.2 + index * 0.1}
                  duration={0.4}
                  key={index}
                >
                  {word}
                </TextAnimate>
              );
            })
            .reduce(
              (prev: Array<React.ReactElement | string>, curr, index) => {
                return index === 0 ? [curr] : [...prev, " ", curr];
              },
              [] as Array<React.ReactElement | string>
            )}
        </h1>

        {/* Description */}
        <p className="text-center text-sm font-medium tracking-tight text-muted-foreground md:text-sm lg:text-base mx-auto mt-6 max-w-lg mb-12">
          <TextAnimate
            animation="fadeIn"
            as="span"
            by="word"
            className="inline"
            delay={0.8}
            duration={0.6}
          >
            {description}
          </TextAnimate>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button
            asChild
            className="group px-8 py-4 text-lg font-medium bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <a href={primaryButtonHref}>
              {primaryButtonText}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
