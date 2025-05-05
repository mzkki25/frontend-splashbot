"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { FileText, ImageIcon, Upload, X, Loader2 } from "lucide-react"
import { validateFile } from "@/lib/validators"
import { useErrorHandler } from "@/components/error-handler"

interface EnhancedFileUploadProps {
  onFileSelect: (file: File | null) => void
  disabled?: boolean
  maxSizeMB?: number
  acceptedTypes?: string[]
}

export default function EnhancedFileUpload({
  onFileSelect,
  disabled = false,
  maxSizeMB = 10,
  acceptedTypes = ["application/pdf", "image/*"],
}: EnhancedFileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { handleFileError } = useErrorHandler()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (!file) {
      return
    }

    const validation = validateFile(file)

    if (!validation.valid) {
      handleFileError(validation.errorType as any)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setSelectedFile(file)
    onFileSelect(file)

    toast({
      title: "File selected",
      description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    })
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const simulateUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      // Simulate upload process
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Randomly fail some uploads for testing
          if (selectedFile.name.includes("error")) {
            reject(new Error("file/upload-failed"))
          } else {
            resolve(true)
          }
        }, 2000)
      })

      toast({
        title: "File uploaded",
        description: `${selectedFile.name} has been uploaded successfully.`,
      })
    } catch (error: any) {
      handleFileError(error)
      handleRemoveFile()
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {selectedFile ? (
        <div className="p-2 bg-blue-50 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            {selectedFile.type.includes("pdf") ? (
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
            ) : (
              <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
            )}
            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload PDF or Image</span>
        </Button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes.join(",")}
        className="hidden"
        disabled={disabled || isUploading}
      />
      {selectedFile && !isUploading && (
        <div className="text-xs text-gray-500">
          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          {" · "}
          {selectedFile.type.split("/")[1].toUpperCase()}
        </div>
      )}
    </div>
  )
}
