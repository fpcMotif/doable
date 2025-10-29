import type React from "react";
import { CtaSection } from "./CtaSection";
import { CustomNavbar } from "./CustomNavbar";
import { FeaturesSection } from "./FeaturesSection";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { HorizontalLine } from "./HorizontalLine";
import { HowToUseSection } from "./HowToUseSection";

type LandingPageProps = {
  className?: string;
};

export const LandingPage: React.FC<LandingPageProps> = ({ className = "" }) => {
  return (
    <div
      className={`min-h-screen bg-background text-foreground relative pt-20 ${className}`}
    >
      {/* Left Vertical Line - positioned to match navbar content width */}
      <div
        className="fixed top-0 h-full w-px bg-gray-200 dark:bg-gray-700 z-10"
        style={{ left: "calc(50vw - 640px)" }}
      ></div>

      {/* Right Vertical Line - positioned to match navbar content width */}
      <div
        className="fixed top-0 h-full w-px bg-gray-200 dark:bg-gray-700 z-10"
        style={{ right: "calc(50vw - 640px)" }}
      ></div>

      {/* Navigation */}
      <CustomNavbar />
      <HorizontalLine />

      {/* Hero Section */}
      <HeroSection
        description="The task management platform that actually works. Beautiful, intuitive, and built for teams who ship."
        highlightText="Faster"
        title="Ship Faster, Work Smarter"
      />

      <HorizontalLine />

      {/* How to Use Section */}
      <HowToUseSection />

      <HorizontalLine />

      {/* Features Section */}
      <FeaturesSection />

      <HorizontalLine />

      {/* CTA Section */}
      <CtaSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};
