// src/components/ChartJS.tsx
"use client"; // ← required for any canvas‑based lib in the Next app router

import {
  BarElement,
  CategoryScale,
  Chart as ChartJSCore,
  ChartData,
  ChartOptions,
  ChartTypeRegistry,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import {
  Bar,
  Doughnut,
  Line,
  Pie,
  PolarArea,
  Radar,
  Scatter,
  Chart as ReactChart,
  ChartProps,
} from "react-chartjs-2";
import { motion } from "framer-motion";
import { FC, PropsWithChildren } from "react";

/* -------------------------------------------------------------
   Register the Chart.js components we might use.
   (Only the ones you import will be bundled – keep this list tight)
---------------------------------------------------------------- */
ChartJSCore.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

/* -------------------------------------------------------------
   Types – we expose a narrow set of allowed chart types.
---------------------------------------------------------------- */
export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "doughnut"
  | "polarArea"
  | "radar"
  | "scatter";

export interface ChartJSProps {
  /** Chart type – defaults to "line". */
  type?: ChartType;
  /** Data object that follows the Chart.js spec. */
  data: any;
  /** Optional Chart.js options (also follows the spec). */
  options?: any;
  /** Tailwind / custom classes for the container (default: `w-full h-64`). */
  className?: string;
}

/* -------------------------------------------------------------
   Generic wrapper – selects the right ReactChart component
   based on the `type` prop.
---------------------------------------------------------------- */
export const ChartJS: FC<ChartJSProps> = ({
  type = "line",
  data,
  options,
  className = "w-full h-30",
}) => {
  // Choose the proper ReactChart component.
  const ChartComponent = (() => {
    switch (type) {
      case "bar":
        return Bar;
      case "pie":
        return Pie;
      case "doughnut":
        return Doughnut;
      case "polarArea":
        return PolarArea;
      case "radar":
        return Radar;
      case "scatter":
        return Scatter;
      case "line":
      default:
        return Line;
    }
  })();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* The `react-chartjs-2` wrapper automatically creates the <canvas>. */}
      <ChartComponent data={data} options={options} />
    </motion.div>
  );
};

/* -------------------------------------------------------------
   Handy preset components (optional – you can import them directly
   if you prefer a more semantic name).
---------------------------------------------------------------- */
export const LineChart: FC<Omit<ChartJSProps, "type">> = (props) => (
  <ChartJS {...props} type="line" />
);
export const BarChart: FC<Omit<ChartJSProps, "type">> = (props) => (
  <ChartJS {...props} type="bar" />
);
export const PieChart: FC<Omit<ChartJSProps, "type">> = (props) => (
  <ChartJS {...props} type="pie" />
);
