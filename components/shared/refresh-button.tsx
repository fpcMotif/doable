"use client";

import { Button } from "@/components/ui/button";

export function RefreshButton() {
  return (
    <Button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={() => window.location.reload()}
    >
      Refresh Page
    </Button>
  );
}
