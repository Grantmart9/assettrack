import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UpdateData = {
  email: string;
  name: string;
};

export const setError = (message: string) => {
  console.error("Error:", message);
};

export const setSuccess = (message: string) => {
  console.log("Success:", message);
};
