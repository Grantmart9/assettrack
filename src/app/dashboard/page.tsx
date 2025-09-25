"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import { WesternCapeMap } from "@/components/WesternCapeMap";
import { BarChart } from "@/components/ChartJS";
import { assetService, Asset } from "@/lib/services/assetService";
import { auditLogService, AuditLog } from "@/lib/services/auditLogService";
import { useState, useEffect } from "react";

// Extended Asset type for dashboard that includes lat/lng when available
interface DashboardAsset extends Asset {
  lat?: number;
  lng?: number;
}

// Asset type for map component (simplified)
interface MapAsset {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

// Chart type definitions
interface ChartDataset {
  data: number[];
  backgroundColor: string;
}

interface ChartData {
  title?: string;
  number?: number;
  labels: string[];
  datasets: ChartDataset[];
}

interface BarChartWidgetProps {
  data: ChartData;
  index?: number;
}

const chartLabels = [
  "Jan",
  "Feb",
  "March",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getChartData = (assets: DashboardAsset[]): ChartData[] => [
  {
    title: "Total Assets",
    number: assets.length,
    labels: chartLabels,
    datasets: [
      {
        data: [
          2000, 800, 1459, 1230, 1480, 1278, 4433, 4321, 4332, 4543, 4556, 4776,
        ],
        backgroundColor: "#1014e8",
      },
    ],
  },
  {
    title: "Overdue checkins",
    number: assets.filter((a) => a.status === "checked_in").length,
    labels: chartLabels,
    datasets: [
      {
        data: [1, 8, 5, 3, 8, 7, 4, 2, 3, 4, 6, 7],
        backgroundColor: "#fcd703",
      },
    ],
  },
  {
    title: "Overdue Inspections",
    number: assets.filter((a) => {
      // Check if asset has an inspectionDate and if it's past the current date
      if (!a.inspectionDate) return false;
      const inspectionDate = new Date(a.inspectionDate);
      const currentDate = new Date();
      return inspectionDate < currentDate;
    }).length,
    labels: chartLabels,
    datasets: [
      {
        data: [2, 1, 2, 3, 1, 0, 0, 2, 2, 3, 1, 0],
        backgroundColor: "#fc0307",
      },
    ],
  },
];

const BarChartWidget = ({ data, index }: BarChartWidgetProps) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 0 }}
      className="bg-white p-3 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">{data.title || "Chart"}</h2>
      <div className="grid grid-flow-col gap-1">
        <div
          className="text-3xl font-bold align-center justify-center flex items-center lg:bg-blue-500/10 rounded-full lg:border-y-8 lg:border-x-2 border-gray-700 flex-shrink-0"
          style={{ color: data.datasets[0].backgroundColor }}
        >
          {data.number || 0}
        </div>
        <section className="space-y-8">
          {/* Bar chart – we override container size with Tailwind */}
          <BarChart
            className="w-full h-36"
            data={data.datasets ? data : data}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { display: false },
                },
                x: {
                  grid: { display: false },
                },
              },
            }}
          />
        </section>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [assets, setAssets] = useState<DashboardAsset[]>([]);
  const [mapAssets, setMapAssets] = useState<MapAsset[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get recent inspections (assets with inspection dates, sorted by date)
  const getRecentInspections = () => {
    return assets
      .filter((asset) => asset.inspectionDate)
      .sort(
        (a, b) =>
          new Date(b.inspectionDate!).getTime() -
          new Date(a.inspectionDate!).getTime()
      )
      .slice(0, 10); // Show last 10 inspections
  };

  // Helper function to get overdue warranties
  const getOverdueWarranties = () => {
    const currentDate = new Date();
    return assets
      .filter((asset) => {
        if (!asset.warrantiesDate) return false;
        const warrantyDate = new Date(asset.warrantiesDate);
        return warrantyDate < currentDate;
      })
      .sort(
        (a, b) =>
          new Date(a.warrantiesDate!).getTime() -
          new Date(b.warrantiesDate!).getTime()
      );
  };

  // Helper function to get inspection status
  const getInspectionStatus = (asset: DashboardAsset) => {
    if (!asset.inspectionDate) return null;

    const inspectionDate = new Date(asset.inspectionDate);
    const currentDate = new Date();
    const daysDiff = Math.ceil(
      (inspectionDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
    );

    if (daysDiff < 0) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Overdue
        </span>
      );
    } else if (daysDiff <= 7) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Due Soon
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Current
        </span>
      );
    }
  };

  // Convert assets to map format
  const convertToMapAssets = (assets: DashboardAsset[]): MapAsset[] => {
    return assets
      .filter((asset) => asset.lat && asset.lng) // Only include assets with coordinates
      .map((asset) => ({
        id: asset.id,
        lat: asset.lat!,
        lng: asset.lng!,
        label: asset.name,
      }));
  };

  // Helper function to format audit log for display
  const formatAuditLogForDisplay = (log: AuditLog) => {
    const getActionDescription = (action: string, details: string | null) => {
      switch (action) {
        case "USER_LOGIN":
          return "User logged in";
        case "USER_LOGOUT":
          return "User logged out";
        case "ASSET_CREATED":
          return "New asset added";
        case "ASSET_UPDATED":
          return "Asset updated";
        case "ASSET_DELETED":
          return "Asset deleted";
        case "ASSET_CHECKED_OUT":
          return "Asset checked out";
        case "ASSET_CHECKED_IN":
          return "Asset checked in";
        case "QR_CODE_SCANNED":
          return "QR code scanned";
        case "INSPECTION_COMPLETED":
          return "Inspection completed";
        case "USER_REGISTERED":
          return "New user registered";
        case "TEST_LOG_CREATION":
          return "System test performed";
        default:
          return action.replace(/_/g, " ").toLowerCase();
      }
    };

    const getTimeAgo = (timestamp: string) => {
      const now = new Date();
      const logTime = new Date(timestamp);
      const diffInMs = now.getTime() - logTime.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
      if (diffInHours < 24)
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      return logTime.toLocaleDateString();
    };

    return {
      id: log.id,
      title: getActionDescription(log.action, log.details),
      description: log.details || "",
      timeAgo: getTimeAgo(log.timestamp),
      userId: log.userId,
      assetId: log.assetId,
    };
  };

  // Fetch assets from Supabase
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: fetchedAssets, error: fetchError } =
          await assetService.getAll();

        if (fetchError) {
          throw new Error(fetchError.message || "Failed to fetch assets");
        }

        // Cast to DashboardAsset to handle potential extra fields from database
        const dashboardAssets = fetchedAssets as DashboardAsset[];
        setAssets(dashboardAssets);
        setMapAssets(convertToMapAssets(dashboardAssets));
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Fetch recent audit logs via API
  useEffect(() => {
    const fetchRecentLogs = async () => {
      try {
        setLogsLoading(true);

        const response = await fetch("/api/logs");
        const result = await response.json();

        if (!result.success) {
          console.error("Error fetching recent logs:", result.error);
        } else {
          setRecentLogs(result.data || []);
        }
      } catch (err) {
        console.error("Error fetching recent logs:", err);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchRecentLogs();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-600">
              {loading ? (
                <span>Loading assets...</span>
              ) : (
                <span>{assets.length} assets loaded</span>
              )}
            </div>
          </div>

          {/* Show error message if any */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Summary Widgets */}
          <div className="grid grid-flow-row md:grid-cols-2 gap-6 mb-8">
            <div className="grid grid-rows-3 md:grid-rows-3 gap-6 bg-transparent">
              {getChartData(assets).map((item, index) => (
                <BarChartWidget key={index} data={item} index={index} />
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-500">Loading map...</div>
                </div>
              ) : (
                <WesternCapeMap
                  className="rounded-md h-full"
                  assets={mapAssets}
                />
              )}
            </div>
          </div>
          <div className="grid grid-flow-row gap-6">
            {/* Inspections and Warranties Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Inspections Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-3 py-3 sm:px-3 border-b border-gray-200">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Inspections
                  </h2>
                </div>
                <div className="px-4 py-5 sm:px-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asset
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                                <span className="text-gray-500">
                                  Loading inspections...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : getRecentInspections().length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center">
                              <div className="text-gray-500">
                                <div className="text-4xl mb-2">📋</div>
                                <div className="text-lg font-medium mb-1">
                                  No recent inspections
                                </div>
                                <div className="text-sm">
                                  Assets with inspection dates will appear here.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          getRecentInspections().map((asset) => (
                            <tr key={asset.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {asset.name}{" "}
                                {asset.serial ? `(${asset.serial})` : ""}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getInspectionStatus(asset) || (
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      asset.inspectionDate!
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Warranties Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden mt-5">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Overdue Warranties
                  </h2>
                </div>
                <div className="px-4 py-5 sm:px-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asset
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expiry Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                                <span className="text-gray-500">
                                  Loading warranties...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : getOverdueWarranties().length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center">
                              <div className="text-gray-500">
                                <div className="text-4xl mb-2">✅</div>
                                <div className="text-lg font-medium mb-1">
                                  No overdue warranties
                                </div>
                                <div className="text-sm">
                                  Assets with expired warranties will appear
                                  here.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          getOverdueWarranties().map((asset) => (
                            <tr key={asset.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {asset.name}{" "}
                                {asset.serial ? `(${asset.serial})` : ""}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  asset.warrantiesDate!
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow mb-8 mt-5"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-500">
                    Loading recent activity...
                  </span>
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-lg font-medium mb-1">
                    No recent activity
                  </div>
                  <div className="text-sm">
                    System activities will appear here as they occur.
                  </div>
                </div>
              ) : (
                recentLogs.map((log, index) => {
                  const formatted = formatAuditLogForDisplay(log);
                  return (
                    <div
                      key={log.id}
                      className={`flex items-center justify-between p-4 ${
                        index < recentLogs.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatted.title}
                        </p>
                        {formatted.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {formatted.description}
                          </p>
                        )}
                        {log.assetId && (
                          <p className="text-xs text-blue-600 mt-1">
                            Asset ID: {log.assetId}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 flex-shrink-0 ml-4">
                        {formatted.timeAgo}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
