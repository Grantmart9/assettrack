// AssetsPage - React component for managing assets: listing, creating, editing, deleting, and QR code scanning for new assets
"use client";

// Import React hooks for state, effect, and refs
import { useState, useEffect, useRef } from "react";

// Import protected route component to ensure authentication
import ProtectedRoute from "@/components/ProtectedRoute";

// Import framer-motion for animations
import { motion } from "framer-motion";

// Import jsQR for QR code detection from camera
import jsQR from "jsqr";

// Import AssetSummaryGrid component for dashboard summary
import AssetSummaryGrid from "@/components/AssetSummaryGrid";

// Import Next.js Link for navigation
import Link from "next/link";

// Import asset service and types for CRUD operations
import {
  assetService,
  type AssetInsert,
  type Asset,
} from "@/lib/services/assetService";

// Import auth hook for user authentication
import { useAuth } from "@/lib/supabase/context";

// Import audit log service for logging actions
import { auditLogService } from "@/lib/services/auditLogService";

// Constant for scale animation on hover
const scale_amount = 1.02;

// Utility function to generate a simple random ID for new assets (in production, use UUID from backend)
const generateAssetId = (): string => {
  return (
    "asset_" +
    Math.random().toString(36).substr(2, 9) +
    "_" +
    Date.now().toString(36)
  );
};

// Main component for the assets page
export default function AssetsPage() {
  // State for form and UI management
  const [showForm, setShowForm] = useState(false); // Controls visibility of the add asset modal
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [isScanning, setIsScanning] = useState(false); // Controls QR scanning state
  const [qrCode, setQrCode] = useState(""); // Stores the scanned or entered QR code value
  const [formData, setFormData] = useState<Partial<AssetInsert>>({
    name: "",
    category: "",
    serial: "",
    qr: "",
    condition: "",
    status: "available",
    purchaseDate: "",
    inspectionDate: "",
    warrantiesDate: "",
    photos: [],
    documents: [],
  }); // Form data for new asset creation
  const [error, setError] = useState<string | null>(null); // General error state for form
  const [assets, setAssets] = useState<Asset[]>([]); // List of all assets
  const [isLoadingAssets, setIsLoadingAssets] = useState(true); // Loading state for assets list
  const [assetsError, setAssetsError] = useState<string | null>(null); // Error state for assets loading
  const [inspectionAssets, setInspectionAssets] = useState<Asset[]>([]); // Assets for inspection dashboard
  const [isLoadingInspections, setIsLoadingInspections] = useState(true); // Loading state for inspection data
  const [inspectionsError, setInspectionsError] = useState<string | null>(null); // Error state for inspections
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null); // Selected asset for view/edit modal
  const [detailMode, setDetailMode] = useState<"view" | "edit" | null>(null); // Mode for asset detail modal (view or edit)
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for asset update
  const [updateError, setUpdateError] = useState<string | null>(null); // Error state for update
  const [editFormData, setEditFormData] = useState<Partial<Asset>>({
    qr: "",
  }); // Form data for editing asset

  // Refs for camera functionality in QR scanning
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get current user from auth context
  const { user } = useAuth();

  // Fetch all assets from the service
  const fetchAssets = async () => {
    setIsLoadingAssets(true);
    setAssetsError(null);

    try {
      const { data, error } = await assetService.getAll();

      if (error) {
        setAssetsError("Failed to load assets. Please try again.");
        console.error("Error fetching assets:", error);
      } else {
        setAssets(data);
      }
    } catch (err) {
      setAssetsError("An unexpected error occurred while loading assets.");
      console.error("Unexpected error:", err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Fetch last 10 assets for inspection statistics
  const fetchInspectionAssets = async () => {
    setIsLoadingInspections(true);
    setInspectionsError(null);

    try {
      console.log(
        "🔍 DEBUG: Starting fetchInspectionAssets with optimized query"
      );
      const { data, error } = await assetService.getLastNAssets(10);

      if (error) {
        console.error("❌ DEBUG: Supabase error:", error);
        setInspectionsError(
          "Failed to load inspection data. Please try again."
        );
        console.error("Error fetching inspection assets:", error);
      } else {
        console.log(
          `✅ DEBUG: Fetched ${data.length} assets using optimized query`
        );
        console.log("📊 DEBUG: Sample asset data:", data.slice(0, 2));

        console.log(
          `📋 DEBUG: Last 10 assets (already sorted):`,
          data.map((a) => ({
            id: a.id,
            name: a.name,
            updatedAt: a.updatedAt,
            createdAt: a.createdAt,
            inspectionDate: a.inspectionDate,
            hasInspectionDate: !!a.inspectionDate,
          }))
        );

        const assetsWithInspectionDate = data.filter((a) => a.inspectionDate);
        console.log(
          `🔍 DEBUG: ${assetsWithInspectionDate.length} out of ${data.length} assets have inspection dates`
        );

        setInspectionAssets(data);
      }
    } catch (err) {
      console.error(
        "🚨 DEBUG: Unexpected error in fetchInspectionAssets:",
        err
      );
      setInspectionsError(
        "An unexpected error occurred while loading inspection data."
      );
      console.error("Unexpected inspection error:", err);
    } finally {
      setIsLoadingInspections(false);
    }
  };

  // Calculate inspection statistics from fetched data
  const getInspectionStats = () => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let upcoming = 0;
    let overdue = 0;
    let completed = 0;

    inspectionAssets.forEach((asset) => {
      if (asset.inspectionDate) {
        const inspectionDate = new Date(asset.inspectionDate);

        if (inspectionDate < now) {
          // Past inspection date - consider overdue
          overdue++;
        } else if (inspectionDate <= oneWeekFromNow) {
          // Due within a week
          upcoming++;
        }
      }
    });

    // If no inspection data, use asset count as fallback with mock distribution
    if (inspectionAssets.length === 0 && assets.length > 0) {
      const total = Math.min(assets.length, 25);
      upcoming = Math.floor(total * 0.5);
      overdue = Math.floor(total * 0.2);
      completed = total - upcoming - overdue;
    }

    return { upcoming, overdue, completed };
  };

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
    fetchInspectionAssets();
  }, []);

  // Handler to view asset details
  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailMode("view");
    setUpdateError(null);
  };

  // Handler to delete an asset with confirmation and audit logging
  const handleDeleteAsset = async (asset: Asset) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await assetService.delete(asset.id);

      if (error) {
        setAssetsError(
          `Failed to delete asset: ${error.message || "Unknown error"}`
        );
        console.error("Error deleting asset:", error);

        // Log the failed deletion attempt
        if (user?.id) {
          try {
            await auditLogService.logError(
              user.id,
              "ASSET_DELETE",
              `Failed to delete asset ${asset.name}: ${error.message}`,
              asset.id
            );
          } catch (auditError) {
            console.error("Failed to log deletion error:", auditError);
          }
        }
        return;
      }

      // Log successful deletion
      if (user?.id) {
        try {
          await auditLogService.logAssetDeleted(user.id, asset.id, asset.name);
        } catch (auditError) {
          console.error("Failed to log asset deletion:", auditError);
        }
      }

      // Refresh the assets list after successful deletion
      await fetchAssets();

      // Clear any existing errors since deletion was successful
      setAssetsError(null);
    } catch (err) {
      setAssetsError("An unexpected error occurred while deleting the asset.");
      console.error("Unexpected delete error:", err);

      // Log the unexpected error
      if (user?.id) {
        try {
          await auditLogService.logError(
            user.id,
            "ASSET_DELETE",
            `Unexpected error deleting asset ${asset.name}: ${err}`,
            asset.id
          );
        } catch (auditError) {
          console.error("Failed to log deletion error:", auditError);
        }
      }
    }
  };

  // Handler to edit an asset
  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailMode("edit");
    setEditFormData({
      ...asset,
      qr: asset.qr || "",
    });
    setUpdateError(null);
  };

  // Handler to close the detail modal
  const handleCloseDetail = () => {
    setSelectedAsset(null);
    setDetailMode(null);
    setUpdateError(null);
  };

  // Handler to update an asset with audit logging
  const handleUpdateAsset = async (updatedAsset: Partial<Asset>) => {
    if (!selectedAsset) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const { data, error } = await assetService.update(selectedAsset.id, {
        ...updatedAsset,
        updatedAt: new Date().toISOString(),
      });

      if (error) {
        setUpdateError("Failed to update asset. Please try again.");
        console.error("Asset update error:", error);

        // Log the failed update attempt
        if (user?.id) {
          try {
            await auditLogService.logError(
              user.id,
              "ASSET_UPDATE",
              `Failed to update asset ${selectedAsset.name}: ${error.message}`,
              selectedAsset.id
            );
          } catch (auditError) {
            console.error("Failed to log update error:", auditError);
          }
        }
      } else {
        console.log("Asset updated successfully:", data);

        // Log successful update
        if (user?.id) {
          try {
            // Generate a summary of changes
            const changes = Object.entries(updatedAsset)
              .filter(
                ([key, value]) =>
                  value !== undefined &&
                  value !== selectedAsset[key as keyof Asset]
              )
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ");

            await auditLogService.logAssetUpdated(
              user.id,
              selectedAsset.id,
              selectedAsset.name,
              changes || "No changes detected"
            );
          } catch (auditError) {
            console.error("Failed to log asset update:", auditError);
          }
        }

        handleCloseDetail();
        fetchAssets(); // Refresh the assets list
      }
    } catch (err) {
      setUpdateError("An unexpected error occurred while updating the asset.");
      console.error("Unexpected update error:", err);

      // Log the unexpected error
      if (user?.id) {
        try {
          await auditLogService.logError(
            user.id,
            "ASSET_UPDATE",
            `Unexpected error updating asset ${selectedAsset.name}: ${err}`,
            selectedAsset.id
          );
        } catch (auditError) {
          console.error("Failed to log update error:", auditError);
        }
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler to open the add asset form
  const handleAddClick = () => {
    setShowForm(true);
    setError(null);
  };

  // Handler to close the add asset form and reset state
  const handleCloseForm = () => {
    setShowForm(false);
    setQrCode("");
    setFormData({
      name: "",
      category: "",
      serial: "",
      qr: "",
      condition: "",
      status: "available",
      purchaseDate: "",
      inspectionDate: "",
      warrantiesDate: "",
      photos: [],
      documents: [],
    });
    setError(null);
  };

  // Handler for form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Start camera for QR scanning in the form
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

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  // Capture image from video for QR detection
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setQrCode(code.data);
        } else {
          setError("No QR code detected. Please try again.");
        }
        stopCamera();
        setIsScanning(false);
      }
    }
  };

  // Handler to start QR scanning in the form
  const handleQRScan = async () => {
    setIsScanning(true);
    setError(null);
    await startCamera();
  };

  // Handler for form submission to create new asset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim() || !formData.category?.trim()) {
      setError("Name and category are required");
      return;
    }

    // Mock user for testing - replace with real user check later
    const mockUser = user || { id: "test-user-123" };

    if (!mockUser?.id) {
      setError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const assetData: AssetInsert = {
        id: generateAssetId(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        serial: formData.serial?.trim() || null,
        qr: qrCode.trim() || null,
        condition: formData.condition?.trim() || null,
        status: formData.status || "available",
        purchaseDate: formData.purchaseDate
          ? new Date(formData.purchaseDate).toISOString()
          : null,
        inspectionDate: formData.inspectionDate
          ? new Date(formData.inspectionDate).toISOString()
          : null,
        photos: formData.photos || [],
        documents: formData.documents || [],
        companyId: mockUser.id, // Using user ID as companyId for now
        createdAt: now,
        updatedAt: now,
      };

      const { data, error } = await assetService.create(assetData);

      if (error) {
        setError("Failed to create asset. Please try again.");
        console.error("Asset creation error:", error);
      } else {
        console.log("Asset created successfully:", data);
        handleCloseForm();
        // Refresh the assets list after successful creation
        fetchAssets();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Unexpected error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Modal Form Overlay for adding new asset */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Add New Asset
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Electronics, Transportation, Tools"
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      name="serial"
                      value={formData.serial || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      QR Code
                    </label>
                    <div className="mt-1 space-y-2">
                      <input
                        type="text"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        placeholder="Enter QR code or scan below"
                        className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input type="hidden" name="qr" value={qrCode} />
                      {!isScanning ? (
                        <button
                          type="button"
                          onClick={handleQRScan}
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          📷 Scan QR Code
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-48 bg-gray-200 rounded-md object-cover"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          <button
                            type="button"
                            onClick={captureImage}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                          >
                            📸 Capture QR Code
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              stopCamera();
                              setIsScanning(false);
                            }}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            Cancel Scan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={formData.condition || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="needs_repair">Needs Repair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || "available"}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="available">Available</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Inspection Date
                    </label>
                    <input
                      type="date"
                      name="inspectionDate"
                      value={formData.inspectionDate || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Warranties Date
                    </label>
                    <input
                      type="date"
                      name="warrantiesDate"
                      value={formData.warrantiesDate || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      disabled={isSubmitting}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating..." : "Create Asset"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Asset Detail Popup (View/Edit) */}
          {selectedAsset && detailMode && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {detailMode === "edit" ? "Edit Asset" : "Asset Details"}
                  </h2>
                  <button
                    onClick={handleCloseDetail}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {updateError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {updateError}
                  </div>
                )}

                {detailMode === "edit" ? (
                  // Edit Form
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateAsset(editFormData);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={editFormData.name || selectedAsset.name || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              name: e.target.value,
                            })
                          }
                          required
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          QR Code
                        </label>
                        <input
                          type="text"
                          value={editFormData.qr || selectedAsset.qr || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              qr: e.target.value,
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={
                            editFormData.category ||
                            selectedAsset.category ||
                            ""
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              category: e.target.value,
                            })
                          }
                          required
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Serial Number
                        </label>
                        <input
                          type="text"
                          value={
                            editFormData.serial || selectedAsset.serial || ""
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              serial: e.target.value,
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Condition
                        </label>
                        <select
                          value={
                            editFormData.condition ||
                            selectedAsset.condition ||
                            ""
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              condition: e.target.value,
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select condition</option>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="needs_repair">Needs Repair</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={
                            editFormData.status ||
                            selectedAsset.status ||
                            "available"
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              status: e.target.value,
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="available">Available</option>
                          <option value="checked_out">Checked Out</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          value={
                            editFormData.purchaseDate
                              ? new Date(editFormData.purchaseDate)
                                  .toISOString()
                                  .split("T")[0]
                              : selectedAsset.purchaseDate
                              ? new Date(selectedAsset.purchaseDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              purchaseDate: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null,
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Inspection Date
                        </label>
                        <input
                          type="date"
                          value={
                            editFormData.inspectionDate
                              ? new Date(editFormData.inspectionDate)
                                  .toISOString()
                                  .split("T")[0]
                              : selectedAsset.inspectionDate
                              ? new Date(selectedAsset.inspectionDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              inspectionDate: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null,
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Warranties Date
                        </label>
                        <input
                          type="date"
                          value={
                            editFormData.warrantiesDate
                              ? new Date(editFormData.warrantiesDate)
                                  .toISOString()
                                  .split("T")[0]
                              : selectedAsset.warrantiesDate
                              ? new Date(selectedAsset.warrantiesDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              warrantiesDate: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null,
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={handleCloseDetail}
                        disabled={isUpdating}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isUpdating ? "Updating..." : "Update Asset"}
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Details
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Basic Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Name
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.name}
                            </span>
                          </div>

                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              QR Code
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.qr || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Category
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.category}
                            </span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Serial Number
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.serial || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Status & Condition
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Status
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.status === "available" &&
                                "Available"}
                              {selectedAsset.status === "checked_out" &&
                                "Checked Out"}
                              {selectedAsset.status === "maintenance" &&
                                "Maintenance"}
                              {selectedAsset.status === "retired" && "Retired"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Condition
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.condition || "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Purchase Date
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.purchaseDate
                                ? new Date(
                                    selectedAsset.purchaseDate
                                  ).toLocaleDateString()
                                : "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Inspection Date
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.inspectionDate
                                ? new Date(
                                    selectedAsset.inspectionDate
                                  ).toLocaleDateString()
                                : "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-900">
                              Warranties Date
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedAsset.warrantiesDate
                                ? new Date(
                                    selectedAsset.warrantiesDate
                                  ).toLocaleDateString()
                                : "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        System Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">
                            Asset ID:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {selectedAsset.id}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Created:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {new Date(
                              selectedAsset.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Last Updated:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {new Date(
                              selectedAsset.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={handleCloseDetail}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => setDetailMode("edit")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Edit Asset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assets Error Display */}
          {assetsError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{assetsError}</span>
                <button
                  onClick={fetchAssets}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Inspections Error Display */}
          {inspectionsError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{inspectionsError}</span>
                <button
                  onClick={fetchInspectionAssets}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          <div className="mb-8">
            <AssetSummaryGrid />
          </div>

          {/* Assets Section - main table listing all assets */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Asset
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <motion.table
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="min-w-full divide-y divide-gray-200"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Category
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Serial
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingAssets ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-500">Loading assets...</span>
                      </div>
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-2">📦</div>
                        <div className="text-lg font-medium mb-1">
                          No assets found
                        </div>
                        <div className="text-sm">
                          Create your first asset using the "Add Asset" button
                          above.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    // Status color mapping for badges
                    const getStatusBadge = (status: string) => {
                      const statusClasses = {
                        available: "bg-green-100 text-green-800",
                        checked_out: "bg-red-100 text-red-800",
                        maintenance: "bg-yellow-100 text-yellow-800",
                        retired: "bg-gray-100 text-gray-800",
                      };

                      const statusText = {
                        available: "Available",
                        checked_out: "Checked Out",
                        maintenance: "Maintenance",
                        retired: "Retired",
                      };

                      return (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusClasses[
                              status as keyof typeof statusClasses
                            ] || statusClasses.available
                          }`}
                        >
                          {statusText[status as keyof typeof statusText] ||
                            status}
                        </span>
                      );
                    };

                    return (
                      <motion.tr
                        key={asset.id}
                        whileHover={{ scale: scale_amount }}
                        className="transition duration-300"
                      >
                        <motion.td
                          className="px-6 py-4 whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {asset.name}
                          </div>
                        </motion.td>
                        <motion.td
                          className="px-6 py-4 whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-sm text-gray-500">
                            {asset.category}
                          </div>
                        </motion.td>
                        <motion.td
                          className="px-6 py-4 whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-sm text-gray-500">
                            {asset.serial || "N/A"}
                          </div>
                        </motion.td>
                        <motion.td
                          className="px-6 py-4 whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                        >
                          {getStatusBadge(asset.status || "available")}
                        </motion.td>
                        <motion.td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                          whileHover={{ scale: 1.02 }}
                        >
                          <motion.button
                            className="mr-2 bg-blue-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditAsset(asset)}
                            aria-label={`Edit ${asset.name}`}
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            className="mr-2 bg-yellow-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewAsset(asset)}
                            aria-label={`View ${asset.name}`}
                          >
                            View
                          </motion.button>
                          <motion.button
                            className=" bg-red-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteAsset(asset)}
                            aria-label={`Delete ${asset.name}`}
                          >
                            Delete
                          </motion.button>
                        </motion.td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </motion.table>
          </div>

          {/* Inspections Section - table showing assets with upcoming/overdue inspections */}
          <div className="mb-8 mt-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Inspections</h2>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 0 }}
              className="bg-white rounded-lg shadow overflow-hidden mb-8"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoadingInspections ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                          <span className="text-gray-500">
                            Loading inspection data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : inspectionAssets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-4xl mb-2">📋</div>
                          <div className="text-lg font-medium mb-1">
                            No inspection data available
                          </div>
                          <div className="text-sm">
                            Assets with inspection dates will appear here.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inspectionAssets
                      .filter((asset) => asset.inspectionDate) // Only show assets with inspection dates
                      .map((asset) => {
                        const inspectionDate = new Date(asset.inspectionDate!);
                        const now = new Date();
                        const oneWeekFromNow = new Date(
                          now.getTime() + 7 * 24 * 60 * 60 * 1000
                        );

                        // Determine inspection status badge
                        let statusBadge;
                        if (inspectionDate < now) {
                          statusBadge = (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          );
                        } else if (inspectionDate <= oneWeekFromNow) {
                          statusBadge = (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Due Soon
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          );
                        }

                        return (
                          <tr key={asset.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {asset.name}{" "}
                                {asset.serial ? `(${asset.serial})` : ""}
                              </div>
                              <div className="text-sm text-gray-500">
                                {asset.category}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {inspectionDate.toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {statusBadge}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
