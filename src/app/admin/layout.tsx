/**
 * Admin layout component for the AssetTrack application.
 * Provides a protected wrapper for all admin pages, ensuring authentication.
 * Applies basic styling for the admin section (min-h-screen bg-gray-50).
 *
 * Uses ProtectedRoute to restrict access to authenticated users only.
 */

"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * AdminLayout function component - wraps admin pages with protection and styling.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child admin page content to render
 * @returns {JSX.Element} The protected admin layout JSX with centered content
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Protected wrapper for admin content */}
      <div className="min-h-screen bg-gray-50">
        {/* Centered container for admin pages with responsive padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
