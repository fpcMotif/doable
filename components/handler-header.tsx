'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Logo } from "./logo";

export default function HandlerHeader() {
  const { isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="fixed w-full z-50 h-16 flex items-center justify-between px-6 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <Logo link={isSignedIn ? "/dashboard" : "/"}/>

        <div className="flex items-center gap-4">
          <UserButton appearance={{
            elements: {
              avatarBox: "w-10 h-10"
            }
          }} />
        </div>
      </header>
      <div className="h-16"/> {/* Placeholder for fixed header */}
    </>
  );
}