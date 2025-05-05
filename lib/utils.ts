import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe client-side only code execution
export function isBrowser() {
  return typeof window !== "undefined"
}

// Safe date formatting to avoid hydration mismatches
export function formatDateSafe(date: Date | string) {
  // Use a fixed format that will be consistent between server and client
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
