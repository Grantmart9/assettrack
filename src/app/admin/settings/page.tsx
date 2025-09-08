"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/context";

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    appName: "Asset Tracking SaaS",
    appDescription: "Multi-tenant asset tracking solution",
    enableAuth: true,
    enableNotifications: true,
    enableEmails: true,
    retentionPeriod: 365,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would save these settings to the database
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">System Settings</h1>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Configuration</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Configure system-wide settings
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
                    Application Name
                  </label>
                  <input
                    type="text"
                    name="appName"
                    id="appName"
                    value={settings.appName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="appDescription" className="block text-sm font-medium text-gray-700">
                    Application Description
                  </label>
                  <textarea
                    name="appDescription"
                    id="appDescription"
                    rows={3}
                    value={settings.appDescription}
                    onChange={(e) => setSettings({...settings, appDescription: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="enableAuth"
                    name="enableAuth"
                    type="checkbox"
                    checked={settings.enableAuth}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableAuth" className="ml-2 block text-sm text-gray-900">
                    Enable Authentication
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="enableNotifications"
                    name="enableNotifications"
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                    Enable Notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="enableEmails"
                    name="enableEmails"
                    type="checkbox"
                    checked={settings.enableEmails}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableEmails" className="ml-2 block text-sm text-gray-900">
                    Enable Email Notifications
                  </label>
                </div>

                <div>
                  <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700">
                    Data Retention Period (days)
                  </label>
                  <input
                    type="number"
                    name="retentionPeriod"
                    id="retentionPeriod"
                    value={settings.retentionPeriod}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}