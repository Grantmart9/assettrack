/**
 * Utility functions and types for the AssetTrack application.
 * This file contains common utility functions used throughout the application.
 */

/**
 * Utility imports for class name management.
 * clsx is used for conditional class names, twMerge for Tailwind CSS class merging.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges CSS class names using clsx and tailwind-merge.
 * This utility function is commonly used throughout the application for dynamic styling.
 * It handles conditional classes and properly merges Tailwind CSS classes.
 *
 * @param inputs - Variable number of class values (strings, conditionals, arrays, objects)
 * @returns Merged class string safe for use in JSX className attributes
 *
 * @example
 * cn("bg-red-500", condition && "text-white", ["px-4", "py-2"])
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type definition for user update data.
 * Used when updating user profile information.
 */
export type UpdateData = {
  email: string; // User's email address
  name: string; // User's display name
};

/**
 * Logs error messages to the console.
 * Utility function for consistent error logging throughout the application.
 *
 * @param message - The error message to log
 */
export const setError = (message: string) => {
  console.error("Error:", message);
};

/**
 * Logs success messages to the console.
 * Utility function for consistent success logging throughout the application.
 *
 * @param message - The success message to log
 */
export const setSuccess = (message: string) => {
  console.log("Success:", message);
};
