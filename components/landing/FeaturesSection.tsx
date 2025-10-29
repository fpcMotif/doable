import {
  Brain,
  Code,
  ComponentIcon,
  Globe,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import type React from "react";
import { Card } from "@/components/ui/card";
import { TextAnimate } from "@/components/ui/text-animate";

type FeaturesSectionProps = {
  className?: string;
};

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  className = "",
}) => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Doable AI",
      description:
        "Built-in AI assistant powered by Groq. Create, update, and manage issues with natural language commands. Just ask and get things done. Powered by Groq.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Modern Interface",
      description:
        "Clean, intuitive design inspired by Swiss design principles. Every pixel serves a purpose.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description:
        "Built-in team management with role-based permissions. Work together seamlessly.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description:
        "Built with Next.js 15 and optimized for performance. Experience the speed difference.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with Stack Auth. Your data is always protected.",
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Open Source",
      description:
        "Full source code available. Customize, extend, and contribute to the project.",
    },
  ];

  return (
    <div
      className={`py-20 lg:py-40 relative overflow-hidden ${className}`}
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6">
            <TextAnimate
              animation="slideUp"
              by="word"
              className="inline bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
              delay={0.1}
              duration={0.6}
            >
              Everything you need to manage tasks
            </TextAnimate>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <TextAnimate
              animation="fadeIn"
              as="span"
              by="word"
              className="inline"
              delay={0.4}
              duration={0.8}
            >
              Powerful features designed with Swiss design principles for
              maximum clarity and efficiency.
            </TextAnimate>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              className="group relative p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 h-full"
              key={index}
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  <TextAnimate
                    animation="blurInUp"
                    by="word"
                    className="inline"
                    delay={0.6 + index * 0.1}
                    duration={0.5}
                  >
                    {feature.title}
                  </TextAnimate>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  <TextAnimate
                    animation="fadeIn"
                    as="span"
                    by="word"
                    className="inline"
                    delay={0.8 + index * 0.1}
                    duration={0.6}
                  >
                    {feature.description}
                  </TextAnimate>
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
    </div>
  );
};
