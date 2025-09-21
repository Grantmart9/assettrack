// ScanAssetPage - React component for the asset QR scanning page
// Allows users to scan QR codes to view asset details and perform check-in/check-out operations
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/supabase/context";
import { assetService } from "@/lib/services/assetService";
import { motion } from "framer-motion";
import jsQR from "jsqr";

// Main component for scanning asset QR codes
export default function ScanAssetPage() {
  const { user } = useAuth(); // Get the current authenticated user from Supabase auth context
  const [scanning, setScanning] = useState(false); // Controls whether the camera is active and scanning is ongoing
  const [scanInterval, setScanInterval] = useState<number | null>(null); // Stores the animation frame ID for continuous scanning loop
  const [scanResult, setScanResult] = useState(""); // Stores the raw QR code data after detection
  const [assetData, setAssetData] = useState<any>(null); // Stores the fetched asset data after successful scan
  const [loading, setLoading] = useState(false); // Loading state for fetching asset data
  const [error, setError] = useState(""); // Error state for UI error messages
  const videoRef = useRef<HTMLVideoElement>(null); // Ref for the video element to display camera feed
  const canvasRef = useRef<HTMLCanvasElement>(null); // Ref for the canvas used to capture video frames for QR detection

  // Effect to initialize/stop camera and scanning loop when scanning state changes
  useEffect(() => {
    if (scanning) {
      startCamera(); // Start camera stream when scanning begins
    }

    // Cleanup function to stop camera and cancel scanning loop on unmount or state change
    return () => {
      stopCamera();
      if (scanInterval) {
        cancelAnimationFrame(scanInterval);
      }
    };
  }, [scanning, scanInterval]);

  // Effect to start the continuous QR scanning loop when the video is ready and scanning is active
  useEffect(() => {
    if (videoRef.current && scanning) {
      const video = videoRef.current;
      const startScanning = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          scanContinuously(); // Start the scanning loop once video has enough data
        } else {
          // Add listener to start scanning when video metadata is loaded
          video.addEventListener("loadedmetadata", startScanning);
          return () =>
            video.removeEventListener("loadedmetadata", startScanning);
        }
      };
      startScanning();
    }
  }, [scanning]);

  // Start camera stream - requests user media access for the rear camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use rear/environment facing camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // Attach stream to video element
      }
    } catch (err) {
      setError("Error accessing camera: " + (err as Error).message); // Set UI error if camera access fails
    }
  };

  // Stop camera stream - stops all media tracks to release camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop each track in the stream
    }
  };

  // Continuous QR code scanning loop using requestAnimationFrame for smooth performance
  const scanContinuously = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) {
      return; // Exit if no video, canvas, or scanning not active
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    // Draw current video frame to canvas and scan for QR
    if (context && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        let assetId = code.data;
        // Parse URL if it's a qrcode.link format - extracts asset ID from URL like https://qrcode.link/a/{assetId}
        if (assetId.startsWith("https://qrcode.link/a/")) {
          const url = new URL(assetId);
          assetId = url.pathname.split("/").pop() || assetId;
        }
        console.log(
          "DEBUG scan: Raw QR data:",
          code.data,
          "Extracted ID:",
          assetId
        );
        setScanResult(code.data);
        fetchAssetData(assetId);
        setScanning(false); // Stop scanning after detection
        return; // Stop the loop
      }
    }

    // Continue scanning by requesting the next animation frame
    const interval = requestAnimationFrame(scanContinuously);
    setScanInterval(interval);
  };

  // Fetch asset data by QR value - uses getByQr to lookup asset from the extracted ID
  const fetchAssetData = async (assetId: string) => {
    console.log("DEBUG: Fetching asset with ID:", assetId); // Add logging
    setLoading(true);
    setError("");

    try {
      const { data: asset, error } = await assetService.getByQr(assetId);

      if (error) {
        setError("Error fetching asset data: " + error.message);
        setAssetData(null);
        return;
      }

      if (!asset) {
        setError("Asset not found");
        setAssetData(null);
        return;
      }

      // Enhance asset data with formatted dates and defaults for display
      const enhancedAssetData = {
        ...asset,
        lastInspection: asset.inspectionDate || "Not specified",
        nextInspection: asset.warrantiesDate || "Not specified",
        serial: asset.serial || "N/A",
        condition: asset.condition || "Unknown",
      };

      setAssetData(enhancedAssetData);
    } catch (err) {
      setError("Error fetching asset data: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle asset check-in - calls service to check in the asset and refetches data
  const handleCheckIn = async () => {
    if (!assetData || !user) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await assetService.checkIn(
        assetData.id,
        user.id,
        assetData.name
      );

      if (error) {
        setError("Error checking in asset: " + error.message);
        return;
      }

      // Refetch asset data to get updated information
      await fetchAssetData(assetData.id);

      // Clear the scan result
      setScanResult("");
    } catch (err) {
      setError("Error checking in asset: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle asset check-out - calls service to check out the asset and refetches data
  const handleCheckOut = async () => {
    if (!assetData || !user) return;

    setLoading(true);
    setError("");

    try {
      // Create basic assignment - in a full implementation, this would include form inputs for assignedTo, site, vehicle, dueAt
      const assignment = {
        assetId: assetData.id,
        assignedTo: user.id, // Default to current user; in practice, select from users
        outAt: new Date().toISOString(),
        inAt: null,
        // site: "", vehicle: "", dueAt: "" would be set from UI inputs
      };

      const { error } = await assetService.checkOut(
        assetData.id,
        assignment,
        user.id,
        assetData.name
      );

      if (error) {
        setError("Error checking out asset: " + error.message);
        return;
      }

      // Refetch asset data to get updated information
      await fetchAssetData(assetData.id);

      // Clear the scan result
      setScanResult("");
    } catch (err) {
      setError("Error checking out asset: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Render access denied if user not authenticated
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
            {/* Camera Section - conditionally renders camera, scanning message, or rescan button */}
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
                <div className="space-y-4">
                  {/* Show Start Scan button when not scanning and no asset data */}
                  {!scanning && !assetData && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setScanning(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Start Scan
                      </button>
                    </div>
                  )}
                  {/* Show camera feed and scanning message when scanning */}
                  {scanning && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto max-h-96 bg-gray-200 rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="flex justify-center">
                        <p className="text-sm text-gray-500">
                          Scanning for QR code...
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Show Rescan button after asset is detected and scanned */}
                  {assetData && !scanning && (
                    <div className="flex justify-center space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setScanning(true);
                          setScanResult("");
                          setAssetData(null);
                          setError("");
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Rescan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Asset Information Section - displays fetched asset details or loading/error states */}
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
                      : !scanning && !assetData
                      ? "Click 'Start Scan' to begin scanning an asset QR code"
                      : "Point the camera at a QR code to scan"}
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
