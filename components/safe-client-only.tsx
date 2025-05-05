"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface SafeClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function SafeClientOnly({ children, fallback = null }: SafeClientOnlyProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return fallback
  }

  return <>{children}</>
}
