import { type ClassValue, clsx } from "clsx";

// Utility for className composition with Tailwind support
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Helper to extract error information for logging
export function formatError(error: any): Record<string, any> {
  if (!error) return { message: 'Unknown error' };
  
  try {
    return {
      message: error.message || error.toString() || 'Unknown error',
      details: error.details,
      hint: error.hint,
      code: error.code,
      name: error.name,
      stack: error.stack,
      // Try to stringify the full error
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    };
  } catch (e) {
    return {
      message: String(error),
      error: error,
    };
  }
}
