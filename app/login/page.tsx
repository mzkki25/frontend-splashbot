"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { handleLogin } from "@/lib/auth"
import { useStore } from "@/lib/store"
import AuthFormError from "@/components/auth-form-error"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formError, setFormError] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const setUser = useStore((state) => state.setUser)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError("") // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validation
    if (!formData.email.trim()) {
      setFormError("Email or username cannot be empty")
      return
    }

    if (!formData.password.trim()) {
      setFormError("Password cannot be empty")
      return
    }

    // Prevent multiple submissions
    if (isLoading) return

    setIsLoading(true)

    try {
      console.log("Attempting login with:", formData.email)

      // Call the login function
      const { userId, idToken } = await handleLogin(formData.email, formData.password)

      console.log("Login successful, userId:", userId)

      // Set user in store
      setUser({ id: userId })

      toast({
        title: "Login successful",
        description: "Welcome back to SPLASHBot!",
      })

      // Redirect to chat page
      router.push("/chat")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle different types of errors
      if (error.message.includes("not found")) {
        setFormError("User not found. Please check your email or username.")
      } else if (error.message.includes("password")) {
        setFormError("Incorrect password. Please try again.")
      } else if (error.message.includes("disabled")) {
        setFormError("This account has been disabled. Please contact support.")
      } else if (error.message.includes("too many")) {
        setFormError("Too many unsuccessful login attempts. Please try again later.")
      } else {
        setFormError(`Login failed: ${error.message || "Unknown error"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="Enter your email or username"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {formError && <AuthFormError message={formError} />}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-500">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
