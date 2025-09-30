/**
 * Modern Navigation component for the AssetTrack application.
 * Features a sleek top sidebar-style navigation with glassmorphism effects,
 * smooth animations, and modern UI patterns.
 * Handles logout with Supabase signOut and router push to login.
 */

"use client";

import Link from "next/link";
import { useAuth } from "@/lib/supabase/context";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Menu,
  X,
  Scan,
  Settings,
  BarChart3,
  Users,
  Package,
} from "lucide-react";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

/**
 * Navigation component - renders the app header navigation.
 * Conditional rendering based on auth state.
 *
 * @returns {JSX.Element} Fixed nav bar with links and auth controls
 */
export default function Navigation() {
  // Get user and signOut from auth context, router for navigation
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  /**
   * handleLogout - signs out user and redirects to login.
   * Catches and logs errors.
   */
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Don't render navigation while auth is loading
  if (loading) {
    return null;
  }

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AssetTrack
                </h1>
                <p className="text-xs text-gray-500 -mt-1">
                  Enterprise Asset Management
                </p>
              </div>
            </Link>
          </div>

          {/* Mobile scan button - prominent and easily accessible */}
          {user && (
            <Link
              href="/scan"
              className="md:hidden w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Scan className="w-6 h-6 text-white" />
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-2">
                {/* Dashboard */}
                {user && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 group"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {/* Assets Dropdown */}
                {user && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 group">
                      <Package className="w-4 h-4" />
                      <span>Assets</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-4">
                        <div className="grid gap-3">
                          <Link
                            href="/scan"
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Scan className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-indigo-600">
                                Scan Asset
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Use your device to scan QR/NFC tags
                              </p>
                            </div>
                          </Link>
                          <Link
                            href="/assets"
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-indigo-600">
                                View Assets
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Browse and manage all company assets
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Admin Section */}
                {user && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 group"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Section */}
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.user_metadata?.role || "User"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  );
}

/**
 * ListItem component - renders dropdown menu item with title and description.
 * Used in NavigationMenuContent for assets dropdown.
 *
 * @param {Object} props - li props + custom
 * @param {string} props.href - Link href
 * @param {string} props.title - Item title
 * @param {React.ReactNode} props.children - Description text
 * @returns {JSX.Element} Dropdown list item
 */
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  title: string;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md px-3 py-2 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-sm text-gray-500 leading-tight">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
