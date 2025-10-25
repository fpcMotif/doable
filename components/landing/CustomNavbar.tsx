"use client";
import React from 'react';
import { 
  Navbar, 
  NavBody, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle, 
  NavbarLogo, 
  NavbarButton,
  NavItems 
} from '@/components/ui/resizable-navbar';
import { Button } from '@/components/ui/button';
import { GitHubStarButton } from './GitHubStarButton';

interface CustomNavbarProps {
  className?: string;
}

export const CustomNavbar: React.FC<CustomNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How it Works", link: "#how-it-works" },
    { name: "Pricing", link: "#pricing" },
  ];

  return (
    <Navbar className={className}>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems 
          items={navItems}
          onItemClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="flex items-center gap-3">
          <GitHubStarButton 
            owner="KartikLabhshetwar" 
            repo="doable" 
            variant="outline"
            className="text-sm"
          />
          <NavbarButton href="/dashboard" variant="primary">
            Get Started
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col gap-3">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <GitHubStarButton 
              owner="KartikLabhshetwar" 
              repo="doable" 
              variant="outline"
              className="text-sm justify-start"
            />
            <NavbarButton href="/dashboard" variant="primary">
              Get Started
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
