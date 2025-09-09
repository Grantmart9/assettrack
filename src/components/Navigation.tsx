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
import { ChevronDown } from "lucide-react";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

export default function Navigation() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-2xl font-semibold text-indigo-600 tracking-tight"
          >
            AssetTrack
          </Link>
          <Link
            href="/scan"
            className="text-2xl font-semibold text-indigo-600 tracking-tight"
          >
            <QrCodeScannerIcon className="block md:hidden w-6 h-6" />
          </Link>
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden sm:flex">
            <NavigationMenuList className="flex space-x-6">
              {/* Dashboard */}
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Assets Dropdown with Descriptions */}
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition-colors font-medium [&>svg]:hidden">
                    Assets
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 w-[300px] p-4 bg-white rounded-md shadow-md">
                      <ListItem href="/scan" title="Scan Asset">
                        Use your device to scan a QR or NFC tag to identify and
                        track assets.
                      </ListItem>
                      <ListItem href="/assets" title="View Assets">
                        Browse, search, and manage all company assets in one
                        place.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              {/* Reports */}
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/reports"
                      className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    >
                      Reports
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Admin */}
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    >
                      Admin
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-red-600 hover:border-red-600 border border-transparent rounded-md transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * ListItem component for dropdown entries with title + description
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
