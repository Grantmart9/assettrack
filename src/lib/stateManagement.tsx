import { useState } from "react";

interface UpdateData {
  email: string;
  name: string;
}

export const setError = (message: string) => {
  console.log("Error:", message);
};

export const setSuccess = (message: string) => {
  console.log("Success:", message);
};

export const userService = {
  updateUserData: async (userId: string, userData: UpdateData) => ({
    userId,
    ...userData,
  }),
  getUser: async (id: number | null) => ({ id }),
};
