"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function TestToastPage() {
  const { toast } = useToast()

  const showSuccessToast = () => {
    toast({
      title: "Success!",
      description: "This is a success toast notification.",
    })
  }

  const showErrorToast = () => {
    toast({
      title: "Error!",
      description: "This is an error toast notification.",
      variant: "destructive",
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Toast Notification Test</h1>
      <p className="text-gray-500">Click the buttons below to test toast notifications</p>

      <div className="flex gap-4 mt-4">
        <Button onClick={showSuccessToast}>Show Success Toast</Button>
        <Button variant="destructive" onClick={showErrorToast}>
          Show Error Toast
        </Button>
      </div>
    </div>
  )
}
