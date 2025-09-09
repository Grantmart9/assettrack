"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import { WesternCapeMap } from "@/components/WesternCapeMap";

// src/app/dashboard/page.tsx   (or any other component)
import { BarChart } from "@/components/ChartJS";

// Type definitions
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

const data: ChartData[] = [
  {
    title: "Total Assets",
    number: 24212,
    labels: [
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
    ],
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
    number: 22,
    labels: [
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
    ],
    datasets: [
      {
        data: [120, 80, 45, 30, 80, 78, 43, 21, 32, 43, 56, 76],
        backgroundColor: "#fcd703",
      },
    ],
  },
  {
    title: "Overdue Inspections",
    number: 8,
    labels: [
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
    ],
    datasets: [
      {
        data: [120, 80, 45, 30, 80, 78, 43, 21, 32, 43, 56, 76],
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
      className="bg-white p-3 rounded-lg shadow"
    >
      <h2 className="text-xl font-semibold mb-4">{data.title || "Chart"}</h2>
      <div className="grid grid-flow-col gap-1">
        <div
          className="text-3xl font-bold"
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
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          {/* Summary Widgets */}
          <div className="grid grid-flow-row md:grid-cols-2 gap-6 mb-8">
            <div className="grid grid-rows-3 md:grid-rows-3 gap-6">
              {data.map((item, index) => (
                <BarChartWidget key={index} data={item} index={index} />
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <WesternCapeMap className="rounded-md h-full" />
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
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Laptop (ABC123)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Passed
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Printer (DEF456)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-05-15
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Printer (DEF456)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-05-15
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Vehicle (XYZ789)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Due Soon
                            </span>
                          </td>
                        </tr>
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
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Printer (DEF456)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-05-15
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Printer (DEF456)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-05-15
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Printer (DEF456)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-05-15
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Server (GHI789)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-06-01
                          </td>
                        </tr>
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
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <p className="font-medium">Asset #12345 checked out</p>
                  <p className="text-sm text-gray-500">by John Doe to Site A</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <p className="font-medium">
                    Inspection completed for Asset #67890
                  </p>
                  <p className="text-sm text-gray-500">
                    Passed - signed by Jane Smith
                  </p>
                </div>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">New asset added</p>
                  <p className="text-sm text-gray-500">
                    Laptop - Serial: ABC123
                  </p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
