"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/supabase/context";

// Mock log data - in a real implementation, this would come from a database
const mockLogs = [
  { id: 1, timestamp: "2023-06-15T10:30:00Z", level: "INFO", message: "User john@example.com logged in", user: "john@example.com" },
  { id: 2, timestamp: "2023-06-15T11:45:00Z", level: "INFO", message: "Asset AST-001 checked out to Jane Doe", user: "jane@example.com" },
  { id: 3, timestamp: "2023-06-15T12:15:00Z", level: "WARN", message: "Failed login attempt for user unknown@example.com", user: "unknown@example.com" },
  { id: 4, timestamp: "2023-06-15T13:30:00Z", level: "INFO", message: "Asset AST-002 inspection completed", user: "inspector@example.com" },
  { id: 5, timestamp: "2023-06-15T14:20:00Z", level: "ERROR", message: "Database connection timeout", user: "system" },
  { id: 6, timestamp: "2023-06-15T15:10:00Z", level: "INFO", message: "User jane@example.com logged out", user: "jane@example.com" },
  { id: 7, timestamp: "2023-06-15T16:05:00Z", level: "INFO", message: "Asset AST-003 quarantined due to damage", user: "admin@example.com" },
  { id: 8, timestamp: "2023-06-15T17:30:00Z", level: "WARN", message: "Low disk space on server (15% remaining)", user: "system" },
];

export default function ViewLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // In a real implementation, you would fetch logs from a database
    setLogs(mockLogs);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === "ALL" || log.level === filter;
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          log.user.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">View Logs</h1>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg leading-6 font-medium text-gray-900">System Activity Logs</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                View system activity and error logs
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <label htmlFor="filter" className="mr-2 text-sm font-medium text-gray-700">
                    Filter by level:
                  </label>
                  <select
                    id="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">Info</option>
                    <option value="WARN">Warning</option>
                    <option value="ERROR">Error</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="search" className="mr-2 text-sm font-medium text-gray-700">
                    Search:
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    placeholder="Search logs..."
                  />
                </div>
              </div>
              
              {filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              log.level === "INFO" ? "bg-blue-100 text-blue-800" :
                              log.level === "WARN" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {log.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {log.message}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.user}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No logs found matching your criteria.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}