import React from 'react';
import { CustomNavbar } from './CustomNavbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowToUseSection } from './HowToUseSection';
import { CtaSection } from './CtaSection';
import { Footer } from './Footer';
import { HorizontalLine } from './HorizontalLine';

interface LandingPageProps {
  className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ className = '' }) => {
  return (
    <div className={`min-h-screen bg-background text-foreground relative pt-20 ${className}`}>
      {/* Left Vertical Line - positioned to match navbar content width */}
      <div className="fixed top-0 h-full w-px bg-gray-200 dark:bg-gray-700 z-10" 
           style={{ left: 'calc(50vw - 640px)' }}>
      </div>
      
      {/* Right Vertical Line - positioned to match navbar content width */}
      <div className="fixed top-0 h-full w-px bg-gray-200 dark:bg-gray-700 z-10" 
           style={{ right: 'calc(50vw - 640px)' }}>
      </div>
      
      {/* Navigation */}
      <CustomNavbar />
      <HorizontalLine />
      
      {/* Hero Section */}
      <HeroSection 
        title="Modern Team Task Management"
        highlightText="Modern"
        description="Built for teams who want to get things done. Clean, fast, and powerful task management with Swiss design principles."
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
