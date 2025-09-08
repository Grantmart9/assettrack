"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/context";

// Mock billing data - in a real implementation, this would come from a payment provider API
const mockInvoices = [
  { id: "INV-001", date: "2023-05-01", amount: 299.99, status: "PAID" },
  { id: "INV-002", date: "2023-06-01", amount: 299.99, status: "PAID" },
  { id: "INV-003", date: "2023-07-01", amount: 299.99, status: "PENDING" },
];

const mockSubscription = {
  plan: "Professional",
  price: 299.99,
  period: "monthly",
  nextBillingDate: "2023-07-01",
  assets: 125,
  users: 15,
  maxAssets: 500,
  maxUsers: 50,
};

export default function ViewBillingPage() {
  const { user } = useAuth();
  const [subscription] = useState(mockSubscription);
  const [invoices] = useState(mockInvoices);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">View Billing</h1>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Subscription Details Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Subscription Details</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Your current subscription plan and usage
                </p>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Plan</span>
                    <span className="text-sm font-medium text-gray-900">{subscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Price</span>
                    <span className="text-sm font-medium text-gray-900">${subscription.price.toFixed(2)} / {subscription.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Next Billing Date</span>
                    <span className="text-sm font-medium text-gray-900">{subscription.nextBillingDate}</span>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Usage</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Assets</span>
                          <span className="text-gray-900">{subscription.assets} / {subscription.maxAssets}</span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(subscription.assets / subscription.maxAssets) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Users</span>
                          <span className="text-gray-900">{subscription.users} / {subscription.maxUsers}</span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(subscription.users / subscription.maxUsers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Update Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice History Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Invoice History</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Your recent invoices and payment history
                </p>
              </div>
              <div className="px-4 py-5 sm:px-6">
                {invoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoice.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${invoice.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                invoice.status === "PAID" ? "bg-green-100 text-green-800" :
                                invoice.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No invoices found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}