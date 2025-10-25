import React from 'react';
import { Logo } from './Logo';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-card border-t border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Logo and Description */}
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <Logo />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Modern team task management platform
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex space-x-4 sm:space-x-6">
            <a href="https://github.com/KartikLabhshetwar/doable" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
              GitHub
            </a>
            <Link href="/dashboard" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <a href="#features" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Doable. Licensed under Apache 2.0
          </p>
        </div>
      </div>
    </footer>
  );
};
