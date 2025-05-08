// Form validation functions

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email.trim()) {
    return { valid: false, message: "Email cannot be empty" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address" }
  }

  return { valid: true }
}

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (!username.trim()) {
    return { valid: false, message: "Username cannot be empty" }
  }

  if (username.length < 3) {
    return { valid: false, message: "Username must be at least 3 characters long" }
  }

  // Only allow alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { valid: false, message: "Username can only contain letters, numbers, and underscores" }
  }

  return { valid: true }
}

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password.trim()) {
    return { valid: false, message: "Password cannot be empty" }
  }

  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" }
  }

  return { valid: true }
}

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): { valid: boolean; message?: string } => {
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match" }
  }

  return { valid: true }
}

export const validateFile = (file: File): { valid: boolean; message?: string; errorType?: string } => {
  // Check file type (PDF or image)
  const fileType = file.type
  const isValidType = fileType === "application/pdf" || fileType.startsWith("image/")

  if (!isValidType) {
    return {
      valid: false,
      message: "Please upload a PDF or image file only.",
      errorType: "file/invalid-type",
    }
  }

  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      message: "File size must be less than 10MB.",
      errorType: "file/too-large",
    }
  }

  return { valid: true }
}
