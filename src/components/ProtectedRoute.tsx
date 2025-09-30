/**
 * ProtectedRoute component for the AssetTrack application.
 * Wraps pages to ensure authentication; redirects to /login if not authenticated.
 * Shows loading spinner during auth check.
 *
 * Uses useAuth hook for user/loading state, useEffect for redirect.
 */

"use client";

import { useAuth } from "@/lib/supabase/context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * ProtectedRoute HOC - protects child components/pages from unauthenticated access.
 * Redirects to login if no user, shows loader during auth check.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to protect/render if authenticated
 * @returns {JSX.Element | null} Children if authenticated, loader if loading, null otherwise
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  /**
   * useEffect - monitors auth state and redirects if not authenticated.
   * Uses window.location.href for full page redirect.
   */
  useEffect(() => {
    // Redirect to login if not loading and no user
    if (!loading && !user) {
      // Use Next.js router instead of window.location for better SPA behavior
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render children if user authenticated
  if (user) {
    return <>{children}</>;
  }

  // Return null during redirect (page will navigate)
  return null;
}
