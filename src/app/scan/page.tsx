"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/supabase/context";
import { assetService } from "@/lib/services/assetService";
import { motion } from "framer-motion";

export default function ScanAssetPage() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [assetData, setAssetData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  useEffect(() => {
    if (scanning) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Error accessing camera: " + (err as Error).message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // In a real implementation, you would send this image to a QR code detection service
        // For now, we'll just simulate a scan result
        simulateScan();
      }
    }
  };

  const simulateScan = () => {
    // Simulate scanning a QR code
    const simulatedAssetId = "AST-001"; // This would normally come from QR code detection
    setScanResult(simulatedAssetId);
    fetchAssetData(simulatedAssetId);
  };

  const fetchAssetData = async (assetId: string) => {
    setLoading(true);
    setError("");

    try {
      // In a real implementation, you would query the database for the asset with this ID
      // For now, we'll just simulate some asset data
      const simulatedAssetData = {
        id: assetId,
        name: "Sample Asset",
        category: "Electronics",
        serial: "SN-123456",
        status: "Available",
        condition: "Good",
        lastInspection: "2023-06-15",
        nextInspection: "2023-12-15",
      };

      setAssetData(simulatedAssetData);
    } catch (err) {
      setError("Error fetching asset data: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!assetData) return;

    setLoading(true);
    setError("");

    try {
      // In a real implementation, you would call the assetService.checkIn method
      // For now, we'll just simulate the check-in
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the asset data to reflect the check-in
      setAssetData({
        ...assetData,
        status: "Checked In",
        lastCheckedIn: new Date().toISOString(),
      });

      // Clear the scan result
      setScanResult("");
    } catch (err) {
      setError("Error checking in asset: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!assetData) return;

    setLoading(true);
    setError("");

    try {
      // In a real implementation, you would call the assetService.checkOut method
      // For now, we'll just simulate the check-out
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the asset data to reflect the check-out
      setAssetData({
        ...assetData,
        status: "Checked Out",
        lastCheckedOut: new Date().toISOString(),
      });

      // Clear the scan result
      setScanResult("");
    } catch (err) {
      setError("Error checking out asset: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You must be logged in to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Scan Asset</h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Camera Section */}
            <motion.div
              initial={{ opacity: 0, y: 0 }} // Start with 0 opacity, no vertical offset
              animate={{ opacity: 1, y: 0 }} // Animate to full opacity, no vertical offset
              transition={{ duration: 0.5 }} // Animation duration
              viewport={{ once: true }} // Only animate once when in view
              className="bg-white shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Camera
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Scan a QR code to check in or check out an asset
                </p>
              </div>
              <div className="px-4 py-5 sm:px-6">
                {!scanning ? (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setScanning(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Start Camera
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto max-h-96 bg-gray-200 rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        type="button"
                        onClick={captureImage}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Capture
                      </button>
                      <button
                        type="button"
                        onClick={() => setScanning(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Stop Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Asset Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 0 }} // Start with 0 opacity, no vertical offset
              animate={{ opacity: 1, y: 0 }} // Animate to full opacity, no vertical offset
              transition={{ duration: 0.5 }} // Animation duration
              viewport={{ once: true }} // Only animate once when in view
              className="bg-white shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Asset Information
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {scanResult
                    ? `Scanned asset: ${scanResult}`
                    : "Scan a QR code to view asset information"}
                </p>
              </div>
              <div className="px-4 py-5 sm:px-6">
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : assetData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Asset ID
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {assetData.id}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {assetData.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Category
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {assetData.category}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Serial Number
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {assetData.serial}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              assetData.status === "Available"
                                ? "bg-green-100 text-green-800"
                                : assetData.status === "Checked Out"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {assetData.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Condition
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {assetData.condition}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Last Inspection
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {assetData.lastInspection}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Next Inspection
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {assetData.nextInspection}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={assetData.status === "Checked In"}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          assetData.status === "Checked In"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Check In
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckOut}
                        disabled={assetData.status === "Checked Out"}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          assetData.status === "Checked Out"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        Check Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {scanResult
                      ? "Loading asset information..."
                      : "Scan a QR code to view asset information"}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
