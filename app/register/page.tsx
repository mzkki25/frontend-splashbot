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
import { handleRegister } from "@/lib/auth"
import AuthFormError from "@/components/auth-form-error"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [formError, setFormError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError("") // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validation
    if (!formData.username.trim()) {
      setFormError("Username cannot be empty")
      return
    }

    if (!formData.email.trim()) {
      setFormError("Email cannot be empty")
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address")
      return
    }

    if (!formData.password.trim()) {
      setFormError("Password cannot be empty")
      return
    }

    // Password strength validation
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      // Call the register function
      const result = await handleRegister(formData.username, formData.email, formData.password)

      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
        })

        // Redirect to login page
        router.push("/login")
      } else {
        setFormError("Registration failed. Please try again.")
      }
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle different types of errors
      if (error.message.includes("email-already-in-use") || error.message.includes("already registered")) {
        setFormError("This email is already registered. Please use a different email or try logging in.")
      } else if (error.message.includes("username-already-in-use") || error.message.includes("already taken")) {
        setFormError("This username is already taken. Please choose a different username.")
      } else if (error.message.includes("invalid-email")) {
        setFormError("The email address is not valid.")
      } else if (error.message.includes("weak-password")) {
        setFormError("The password is too weak. Please use a stronger password.")
      } else {
        setFormError("There was an error creating your account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your details to create your SPLASHBot account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {formError && <AuthFormError message={formError} />}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
