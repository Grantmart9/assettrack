/**
 * State management utilities and services for the AssetTrack application.
 * This file contains React state management utilities and mock services for development.
 * Note: This appears to be a development/testing file with mock implementations.
 */

/**
 * React import for state management hooks.
 */
import { useState } from "react";

/**
 * Interface for user update data.
 * Used when updating user profile information in the application.
 */
interface UpdateData {
  email: string; // User's email address
  name: string; // User's display name
}

/**
 * Logs error messages to the console.
 * Development utility function for consistent error logging.
 * Note: This is a mock implementation for development purposes.
 *
 * @param message - The error message to log
 */
export const setError = (message: string) => {
  console.log("Error:", message);
};

/**
 * Logs success messages to the console.
 * Development utility function for consistent success logging.
 * Note: This is a mock implementation for development purposes.
 *
 * @param message - The success message to log
 */
export const setSuccess = (message: string) => {
  console.log("Success:", message);
};

/**
 * Mock user service for development and testing.
 * This service provides placeholder implementations for user operations.
 * In production, these would be replaced with actual API calls to Supabase.
 */
export const userService = {
  /**
   * Updates user data with provided information.
   * Mock implementation that simply returns the merged data.
   * In production, this would update the user record in the database.
   *
   * @param userId - The unique identifier of the user
   * @param userData - The user data to update
   * @returns Promise resolving to updated user object
   */
  updateUserData: async (userId: string, userData: UpdateData) => ({
    userId,
    ...userData,
  }),

  /**
   * Retrieves user information by ID.
   * Mock implementation that returns a basic user object.
   * In production, this would fetch user data from the database.
   *
   * @param id - The user ID (number or null)
   * @returns Promise resolving to user object
   */
  getUser: async (id: number | null) => ({ id }),
};
