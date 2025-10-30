/**
 * Root layout component for the AssetTrack application.
 * This file defines the overall HTML structure, metadata, authentication provider,
 * navigation, and main content area for all pages in the Next.js app.
 *
 * Key features:
 * - Sets up global metadata (title, description)
 * - Wraps the app with AuthProvider for Supabase authentication
 * - Includes desktop Navigation component
 * - Adds mobile NavigationSmall component (bottom tab bar)
 * - Applies global CSS and basic layout styling
 */

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navigation from "@/components/Navigation";

/**
 * Array of navigation items for the mobile bottom navigation bar.
 * Defines the main sections of the app accessible from mobile.
 */
const smallNavItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Assets", href: "/assets" },
  { name: "Reports", href: "/reports" },
  { name: "Admin", href: "/admin" },
];

/**
 * Mobile navigation component (bottom tab bar).
 * Renders a fixed bottom navigation for small screens (md:hidden).
 * Uses Material-UI Button for navigation links with custom styling.
 *
 * @returns {JSX.Element} The mobile navigation bar JSX.
 */
const NavigationSmall = () => (
  <div className="md:hidden fixed w-full bottom-0 mx-auto bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
    {smallNavItems.map((item, index) => (
      <a
        href={item.href}
        key={index}
        className="text-gray-700 hover:bg-gray-100 focus:bg-gray-100 rounded-md px-3 py-2 text-sm font-medium"
      >
        {item.name}
      </a>
    ))}
  </div>
);

/**
 * Metadata configuration for the entire application.
 * Defines the default title and description for SEO and browser tabs.
 *
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "AssetTrack",
  description: "Multi-tenant asset tracking solution",
};

/**
 * Root layout function component.
 * The top-level layout that wraps all pages in the app.
 * Handles authentication context, navigation, and basic page structure.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child page content to render
 * @returns {JSX.Element} The root HTML structure with navigation and main content
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Providers wraps the app to provide Supabase authentication context to all components */}
        <Providers>
          {/* Desktop navigation header */}
          <Navigation />
          {/* Main content area with top padding for navigation, background, and minimum height */}
          <main className="pt-18 bg-gray-50 min-h-screen">{children}</main>
          {/* Mobile bottom navigation bar */}
          <NavigationSmall />
        </Providers>
      </body>
    </html>
  );
}
