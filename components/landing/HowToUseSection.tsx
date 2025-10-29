"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";

type HowToUseSectionProps = {
  className?: string;
};

export const HowToUseSection: React.FC<HowToUseSectionProps> = ({
  className = "",
}) => {
  const steps = [
    {
      number: "01",
      title: "Sign Up for Free",
      description:
        "Create your account in seconds. No credit card required, no hidden fees.",
    },
    {
      number: "02",
      title: "Create Your First Team",
      description:
        "Set up your team workspace and invite your colleagues to collaborate.",
    },
    {
      number: "03",
      title: "Start Managing Tasks",
      description:
        "Create projects, add tasks, and watch your team's productivity soar.",
    },
  ];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.4,
      },
    },
  };

  // Animation variants for each step
  const stepVariants = {
    hidden: {
      opacity: 0,
      x: -50,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
  };

  return (
    <div
      className={`py-16 md:py-24 lg:py-32 bg-muted/30 ${className}`}
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6">
            <TextAnimate
              animation="slideUp"
              by="word"
              className="inline bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
              delay={0.1}
              duration={0.6}
            >
              How to Get Started
            </TextAnimate>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            <TextAnimate
              animation="fadeIn"
              as="span"
              by="word"
              className="inline"
              delay={0.4}
              duration={0.8}
            >
              Get started with Doable in just three simple steps. No complex
              setup required!
            </TextAnimate>
          </p>
        </div>

        {/* Steps */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.3 }}
          whileInView="visible"
        >
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                className="flex items-start gap-6 group"
                key={index}
                transition={{ duration: 0.6, ease: "easeOut" }}
                variants={stepVariants}
              >
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-xl font-bold group-hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step.number}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                    <TextAnimate
                      animation="blurInUp"
                      by="word"
                      className="inline"
                      delay={0.6 + index * 0.2}
                      duration={0.5}
                    >
                      {step.title}
                    </TextAnimate>
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    <TextAnimate
                      animation="fadeIn"
                      as="span"
                      by="word"
                      className="inline"
                      delay={0.8 + index * 0.2}
                      duration={0.6}
                    >
                      {step.description}
                    </TextAnimate>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
