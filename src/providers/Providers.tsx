"use client";

/** Root-level providers wrapper (toasts; future providers plug in here). */

import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
    </>
  );
}
