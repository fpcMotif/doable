'use client';

import { UserButton, useUser } from "@stackframe/stack";
import { useTheme } from "next-themes";
import { Logo } from "./logo";

export default function HandlerHeader() {
  const user = useUser();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="fixed w-full z-50 h-16 flex items-center justify-between px-6 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <Logo link={user ? "/dashboard" : "/"}/>

        <div className="flex items-center gap-4">
          <UserButton colorModeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </div>
      </header>
      <div className="h-16"/> {/* Placeholder for fixed header */}
    </>
  );
}