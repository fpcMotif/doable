"use client";

import { useEffect } from "react";

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove Grammarly and other extension attributes that cause hydration mismatches
    const removeExtensionAttributes = () => {
      // Remove Grammarly attributes
      document.documentElement.removeAttribute("data-gr-ext-installed");
      document.body.removeAttribute("data-new-gr-c-s-check-loaded");

      // Remove any other common extension attributes
      const elements = document.querySelectorAll(
        "[data-new-gr-c-s-check-loaded], [data-gr-ext-installed]"
      );
      elements.forEach((el) => {
        el.removeAttribute("data-new-gr-c-s-check-loaded");
        el.removeAttribute("data-gr-ext-installed");
      });
    };

    // Run immediately
    removeExtensionAttributes();

    // Also run after a short delay to catch any late-loading extensions
    const timeoutId = setTimeout(removeExtensionAttributes, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return <>{children}</>;
}
