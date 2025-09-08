"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/context";

export default function ManageFeaturesPage() {
  const { user } = useAuth();
  const [features, setFeatures] = useState([
    { id: 1, name: "Asset Tracking", enabled: true, description: "Track and manage company assets" },
    { id: 2, name: "QR Code Scanning", enabled: true, description: "Scan QR codes to check in/out assets" },
    { id: 3, name: "Inspection Management", enabled: true, description: "Schedule and track asset inspections" },
    { id: 4, name: "Reporting", enabled: true, description: "Generate detailed asset reports" },
    { id: 5, name: "Notifications", enabled: false, description: "Receive email/SMS notifications" },
    { id: 6, name: "Advanced Analytics", enabled: false, description: "Advanced data analytics and insights" },
  ]);

  const toggleFeature = (id: number) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would save these feature settings to the database
    console.log("Saving features:", features);
    alert("Feature settings saved successfully!");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Features</h1>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Feature Toggles</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Enable or disable application features
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id={`feature-${feature.id}`}
                          name={`feature-${feature.id}`}
                          type="checkbox"
                          checked={feature.enabled}
                          onChange={() => toggleFeature(feature.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`feature-${feature.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                          {feature.name}
                        </label>
                      </div>
                      <div className="text-sm text-gray-500">
                        {feature.description}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Feature Settings
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