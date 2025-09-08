"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/supabase/context";
import { assetService } from "@/lib/services/assetService";
import inspectionService from "@/lib/services/inspectionService";

export default function HomePage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [overdueInspections, setOverdueInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assets
        const { data: assetsData, error: assetsError } = await assetService.getAll();
        if (assetsError) {
          setError("Error fetching assets: " + assetsError.message);
          return;
        }
        setAssets(assetsData || []);

        // Fetch overdue inspections
        const { data: overdueData, error: overdueError } = await inspectionService.getOverdueInspections();
        if (overdueError) {
          setError("Error fetching overdue inspections: " + overdueError.message);
          return;
        }
        setOverdueInspections(overdueData || []);
      } catch (err) {
        setError("An unexpected error occurred: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Asset Tracking SaaS</h1>
          <p className="text-xl text-gray-600 mb-8">Track and manage your assets efficiently</p>
          <div className="space-y-4">
            <a 
              href="/login" 
              className="inline-block w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </a>
            <a 
              href="/signup" 
              className="inline-block w-full py-3 px-6 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Assets Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Total Assets</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Number of assets in your inventory
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-indigo-600">{assets.length}</span>
                </div>
              </div>
            </div>

            {/* Overdue Inspections Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Overdue Inspections</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Assets with inspections past due
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-red-600">{overdueInspections.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Common tasks you can perform
                </p>
                <div className="mt-4 space-y-2">
                  <a 
                    href="/scan" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Scan Asset
                  </a>
                  <a 
                    href="/inspections" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Inspections
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Assets Section */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Assets</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Recently added assets to your inventory
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              {assets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asset ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assets.slice(0, 5).map((asset) => (
                        <tr key={asset.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {asset.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {asset.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {asset.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              asset.status === "Available" ? "bg-green-100 text-green-800" :
                              asset.status === "Checked Out" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No assets found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
