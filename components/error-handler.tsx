"use client"

import { useToast } from "@/components/ui/use-toast"

// Error types
export type AuthErrorType =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/user-disabled"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests"
  | "auth/weak-password"
  | "auth/username-already-in-use"
  | "auth/network-request-failed"

export type FileErrorType = "file/invalid-type" | "file/too-large" | "file/upload-failed" | "file/processing-failed"

export type ApiErrorType =
  | "api/network-error"
  | "api/timeout"
  | "api/server-error"
  | "api/unauthorized"
  | "api/forbidden"
  | "api/not-found"

// Error handler hook
export function useErrorHandler() {
  const { toast } = useToast()

  const handleAuthError = (error: AuthErrorType | Error) => {
    const errorCode = typeof error === "string" ? error : error.message

    switch (errorCode) {
      case "auth/email-already-in-use":
        toast({
          title: "Registration failed",
          description: "This email is already registered. Please use a different email or try logging in.",
          variant: "destructive",
        })
        break
      case "auth/username-already-in-use":
        toast({
          title: "Registration failed",
          description: "This username is already taken. Please choose a different username.",
          variant: "destructive",
        })
        break
      case "auth/invalid-email":
        toast({
          title: "Invalid email",
          description: "The email address is not valid.",
          variant: "destructive",
        })
        break
      case "auth/user-disabled":
        toast({
          title: "Account disabled",
          description: "This account has been disabled. Please contact support.",
          variant: "destructive",
        })
        break
      case "auth/user-not-found":
        toast({
          title: "User not found",
          description: "No account found with this email. Please check your email or register.",
          variant: "destructive",
        })
        break
      case "auth/wrong-password":
      case "auth/invalid-credential":
        toast({
          title: "Login failed",
          description: "Incorrect email or password. Please try again.",
          variant: "destructive",
        })
        break
      case "auth/too-many-requests":
        toast({
          title: "Too many attempts",
          description: "Too many unsuccessful login attempts. Please try again later.",
          variant: "destructive",
        })
        break
      case "auth/weak-password":
        toast({
          title: "Weak password",
          description: "The password is too weak. Please use a stronger password.",
          variant: "destructive",
        })
        break
      case "auth/network-request-failed":
        toast({
          title: "Network error",
          description: "A network error occurred. Please check your connection and try again.",
          variant: "destructive",
        })
        break
      default:
        toast({
          title: "Authentication error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        })
        console.error("Auth error:", error)
    }
  }

  const handleFileError = (error: FileErrorType | Error) => {
    const errorCode = typeof error === "string" ? error : error.message

    switch (errorCode) {
      case "file/invalid-type":
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file only.",
          variant: "destructive",
        })
        break
      case "file/too-large":
        toast({
          title: "File too large",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        })
        break
      case "file/upload-failed":
        toast({
          title: "Upload failed",
          description: "Failed to upload the file. Please try again.",
          variant: "destructive",
        })
        break
      case "file/processing-failed":
        toast({
          title: "Processing failed",
          description: "Failed to process the file. Please try a different file.",
          variant: "destructive",
        })
        break
      default:
        toast({
          title: "File error",
          description: "An error occurred with the file. Please try again.",
          variant: "destructive",
        })
        console.error("File error:", error)
    }
  }

  const handleApiError = (error: ApiErrorType | Error) => {
    const errorCode = typeof error === "string" ? error : error.message

    switch (errorCode) {
      case "api/network-error":
        toast({
          title: "Network error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        })
        break
      case "api/timeout":
        toast({
          title: "Request timeout",
          description: "The request took too long to process. Please try again.",
          variant: "destructive",
        })
        break
      case "api/server-error":
        toast({
          title: "Server error",
          description: "The server encountered an error. Please try again later.",
          variant: "destructive",
        })
        break
      case "api/unauthorized":
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        break
      case "api/forbidden":
        toast({
          title: "Access denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        })
        break
      case "api/not-found":
        toast({
          title: "Not found",
          description: "The requested resource was not found.",
          variant: "destructive",
        })
        break
      default:
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        })
        console.error("API error:", error)
    }
  }

  return {
    handleAuthError,
    handleFileError,
    handleApiError,
  }
}
