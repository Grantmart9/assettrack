/**
 * AssetSummaryGrid component for the AssetTrack dashboard.
 * Fetches assets and calculates statistics for assets, inspections, warranties.
 * Renders a responsive grid of cards with animated metrics.
 * Handles loading and error states using MUI components.
 *
 * Features:
 * - Calculates total, checked out, overdue inspections from assets
 * - Inspection stats: completed, overdue, upcoming (30 days)
 * - Warranty stats: overdue, due soon, active
 * - Uses framer-motion for card animations on hover
 * - Responsive grid: 1 col mobile, 2 md, 3 lg
 */

import { useEffect, useState } from "react";
import { assetService, type Asset } from "@/lib/services/assetService";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";

/**
 * Interface for child data in stats blocks - key-value pairs for metrics (e.g., "Total Assets": 10)
 */
interface ChildrenData {
  [key: string]: number;
}

/**
 * Interface for stat block data - heading and array of child metrics
 */
interface BlockData {
  Heading: string;
  Children: ChildrenData[];
}

/**
 * AssetSummaryGrid component - renders stats cards for assets, inspections, warranties.
 * Fetches assets on mount, calculates stats, displays in animated cards.
 *
 * @returns {JSX.Element} Grid of stat cards or loading/error
 */
export default function AssetSummaryGrid() {
  // State for calculated stats data, loading, and errors
  const [data, setData] = useState<BlockData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * calculateStatsFromAssets - computes BlockData from Asset array.
   * Calculates metrics for assets, inspections (completed, overdue, upcoming 30 days), warranties (overdue, due soon, active).
   * Uses current date for comparisons.
   *
   * @param {Asset[]} assets - Array of assets to analyze
   * @returns {BlockData[]} Array of stat blocks for rendering
   */
  const calculateStatsFromAssets = (assets: Asset[]): BlockData[] => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    // Assets statistics
    const totalAssets = assets.length;
    const checkedOut = assets.filter(
      (asset) => asset.status === "checked_out"
    ).length;
    const overdueInspections = assets.filter(
      (asset) => asset.inspectionDate && new Date(asset.inspectionDate) < now
    ).length;

    // Inspections statistics - completed and overdue are same as overdueInspections for now
    const completedInspections = assets.filter(
      (asset) => asset.inspectionDate && new Date(asset.inspectionDate) < now
    ).length;
    const overdueInspectionsCount = assets.filter(
      (asset) => asset.inspectionDate && new Date(asset.inspectionDate) < now
    ).length;
    const upcomingInspections = assets.filter(
      (asset) =>
        asset.inspectionDate &&
        new Date(asset.inspectionDate) >= now &&
        new Date(asset.inspectionDate) <= thirtyDaysFromNow
    ).length;

    // Warranties statistics (using warrantiesDate field - cast asset as any since type may not include it)
    const overdueWarranties = assets.filter((asset) => {
      const warrantiesDate = (asset as any).warrantiesDate;
      return warrantiesDate && new Date(warrantiesDate) < now;
    }).length;
    const dueSoonWarranties = assets.filter((asset) => {
      const warrantiesDate = (asset as any).warrantiesDate;
      return (
        warrantiesDate &&
        new Date(warrantiesDate) >= now &&
        new Date(warrantiesDate) <= thirtyDaysFromNow
      );
    }).length;
    const activeWarranties = assets.filter((asset) => {
      const warrantiesDate = (asset as any).warrantiesDate;
      return warrantiesDate && new Date(warrantiesDate) > thirtyDaysFromNow;
    }).length;

    // Return array of BlockData for Assets, Inspections, Warranties
    return [
      {
        Heading: "Assets",
        Children: [
          {
            "Total Assets": totalAssets,
            "Checked Out": checkedOut,
            Overdue: overdueInspections,
          },
        ],
      },
      {
        Heading: "Inspections",
        Children: [
          {
            Completed: completedInspections,
            Overdue: overdueInspectionsCount,
            Upcoming: upcomingInspections,
          },
        ],
      },
      {
        Heading: "Warranties",
        Children: [
          {
            Overdue: overdueWarranties,
            "Due soon": dueSoonWarranties,
            Active: activeWarranties,
          },
        ],
      },
    ];
  };

  /**
   * useEffect - fetches assets on mount and calculates stats.
   * Calls assetService.getAll(), handles errors, updates data state.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all assets from service
        const { data: assets, error: assetError } = await assetService.getAll();

        if (assetError) {
          throw new Error(assetError.message || "Failed to fetch assets");
        }

        // Calculate stats from fetched assets
        const calculatedData = calculateStatsFromAssets(assets);
        setData(calculatedData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Render loading state - centered MUI CircularProgress in grid.
   */
  if (loading) {
    return (
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-busy={true}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          className="col-span-full py-8"
        >
          <CircularProgress />
        </Box>
      </section>
    );
  }

  /**
   * Render error state - full-width MUI Alert with error message.
   */
  if (error) {
    return (
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-busy={false}
      >
        <Box className="col-span-full">
          <Alert severity="error">{error}</Alert>
        </Box>
      </section>
    );
  }

  // Main render - responsive grid of animated stat cards
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-busy={false}
    >
      {data?.map((block, index) => (
        <motion.div
          key={block.Heading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
          whileHover={{ y: -5, boxShadow: "0px 8px 20px rgba(0,0,0,0.12)" }}
          className="h-full rounded-lg"
        >
          {/* MUI Card for each stat block with elevation and full height */}
          <Card elevation={3} className="rounded-lg h-full">
            <CardContent>
              {/* Block heading */}
              <Typography
                variant="h6"
                component="h2"
                className="mb-2 font-semibold"
              >
                {block.Heading}
              </Typography>
              <Divider className="my-2" />
              {/* Map over child data to render key-value metrics */}
              {block.Children.map((childData, childIndex) => (
                <dl key={childIndex}>
                  {Object.entries(childData).map(([key, value]) => (
                    <Box
                      key={key}
                      className="flex justify-between items-center py-1"
                    >
                      <dt className="text-sm text-gray-600">{key}:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {value}
                      </dd>
                    </Box>
                  ))}
                </dl>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
