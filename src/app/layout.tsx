import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/context";
import Navigation from "@/components/Navigation";
import { Button } from "@mui/material";

const smallNavItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Assets", href: "/assets" },
  { name: "Reports", href: "/reports" },
  { name: "Admin", href: "/admin" },
];

const NavigationSmall = () => (
  <div className="md:hidden fixed w-full bottom-0 mx-auto bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
    {smallNavItems.map((item, index) => (
      <Button
        sx={{ color: "black", textTransform: "none" }}
        href={item.href}
        key={index}
        className="text-gray-700 hover:bg-gray-100 focus:bg-gray-100 rounded-md px-3 py-2 text-sm font-medium"
      >
        {item.name}
      </Button>
    ))}
  </div>
);

export const metadata: Metadata = {
  title: "AssetTrack",
  description: "Multi-tenant asset tracking solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          <main className="pt-16 bg-gray-50 min-h-screen">{children}</main>
          <NavigationSmall />
        </AuthProvider>
      </body>
    </html>
  );
}
