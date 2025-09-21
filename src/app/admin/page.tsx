/**
 * Admin dashboard page for the AssetTrack application.
 * Displays a grid of cards for admin functions: users, settings, features, logs, billing, reports.
 * Fetches and displays user count, handles loading and error states.
 * Protected for authenticated users only.
 *
 * Uses React hooks for data fetching, UI components for cards/buttons, framer-motion for animations.
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/supabase/context";
import userService from "@/lib/services/userService";
import companyService from "@/lib/services/companyService";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Main AdminPage component - renders the admin dashboard.
 * Fetches users on mount, renders cards with links to admin sections.
 * Handles unauthenticated, loading, and error states.
 *
 * @returns {JSX.Element} The admin dashboard JSX with animated cards.
 */
export default function AdminPage() {
  // Get current user from auth context
  const { user } = useAuth();

  // State for users data, loading, and errors
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * useEffect hook to fetch users data on component mount.
   * Calls userService.getUsers() and handles errors/loading.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users from the service
        const { data: usersData, error: usersError } =
          await userService.getUsers();
        if (usersError) {
          setError("Error fetching users: " + usersError.message);
          return;
        }
        setUsers(usersData || []);
      } catch (err) {
        setError("Unexpected error: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Render access denied view if user not authenticated.
   * Centered message prompting login.
   */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You must be logged in to view this page.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render loading spinner while fetching users.
   * Uses Lucide React icon for spinner animation.
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Main admin dashboard render - authenticated user view
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">
          Admin Dashboard
        </h1>

        {/* Error alert if data fetch failed */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Responsive grid for admin cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Manage Users Card - shows user count and link */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 1,
              restDelta: 0.001,
              restSpeed: 0.001,
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600 mb-4">
                  {users.length} users
                </div>
                <Button asChild variant="outline">
                  <Link href="/admin/users">View Users</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Settings Card - link to settings page */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/admin/settings">Configure Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Manage Features Card - link to features page */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Manage Features</CardTitle>
                <CardDescription>
                  Enable or disable app features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/admin/features">Manage Features</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* View Logs Card - link to logs page */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>View Logs</CardTitle>
                <CardDescription>System activity logs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/admin/logs">View Logs</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Billing Card - link to billing page */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>
                  View billing info and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/admin/billing">View Billing</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          {/* Reports Card - link to reports page */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  View and download asset and maintenance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/reports">Reports</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
