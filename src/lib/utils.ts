import { type ClassValue, clsx } from "clsx";

// Utility for className composition with Tailwind support
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
