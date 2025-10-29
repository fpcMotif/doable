"use client";
import React from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { GitHubStarButton } from "./GitHubStarButton";

type CustomNavbarProps = {
  className?: string;
};

export const CustomNavbar: React.FC<CustomNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <Navbar className={className}>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <div className="flex items-center gap-3">
          <GitHubStarButton
            className="text-sm"
            owner="KartikLabhshetwar"
            repo="doable"
            variant="outline"
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
              className="text-sm justify-start"
              owner="KartikLabhshetwar"
              repo="doable"
              variant="outline"
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
