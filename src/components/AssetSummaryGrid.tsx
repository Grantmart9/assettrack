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

interface ChildrenData {
  [key: string]: number;
}

interface BlockData {
  Heading: string;
  Children: ChildrenData[];
}

export default function AssetSummaryGrid() {
  const [data, setData] = useState<BlockData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Inspections statistics
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

    // Warranties statistics (using warrantiesDate)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: assets, error: assetError } = await assetService.getAll();

        if (assetError) {
          throw new Error(assetError.message || "Failed to fetch assets");
        }

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
          <Card elevation={3} className="rounded-lg h-full">
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                className="mb-2 font-semibold"
              >
                {block.Heading}
              </Typography>
              <Divider className="my-2" />
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
