"use client";

import { AuthProvider } from "@/lib/supabase/context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
