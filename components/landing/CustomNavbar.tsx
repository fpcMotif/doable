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
import { GitHubStarButton } from './GitHubStarButton';

interface CustomNavbarProps {
  className?: string;
}

export const CustomNavbar: React.FC<CustomNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <Navbar className={className}>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems 
          items={[]}
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
