import { clsx, type ClassValue } from "clsx";

// Simplified cn function for NativeWind v2 compatibility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
