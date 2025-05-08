"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Loader2, Send, Upload, FileText, ImageIcon, Menu, X, LogOut } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import ChatMessage from "@/components/chat-message"
import ChatSidebar from "@/components/chat-sidebar"
import { useStore } from "@/lib/store"
import { api } from "@/lib/api"
import {
  clearAuthData,
  getIdToken,
  getCurrentChatSession,
  generateChatSessionId,
  storeCurrentChatSession,
  waitForTokenReady,
} from "@/lib/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatOptionTooltip } from "@/components/chat-option-tooltip"

const CHAT_OPTIONS = [
  "General Macroeconomics",
  "2 Wheels",
  "4 Wheels",
  "Retail General",
  "Retail Beauty",
  "Retail FnB",
  "Retail Drugstore",
]

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get state from store
  const {
    currentChat,
    chatHistory,
    isLoading,
    setIsLoading,
    addMessage,
    setChatHistory,
    createNewChat,
    chatOption,
    setChatOption,
    loadChatMessages,
  } = useStore()

  // Watch for URL changes to load the correct chat
  useEffect(() => {
    const chatId = searchParams.get("id")
    if (chatId && initialLoadComplete && (!currentChat || currentChat.id !== chatId)) {
      console.log("URL changed, loading chat:", chatId)
      loadChatMessages(chatId)
    }
  }, [searchParams, initialLoadComplete, currentChat, loadChatMessages])

  // Check if user is authenticated
  useEffect(() => {
    const initializeChat = async () => {
      const idToken = getIdToken()
      if (!idToken) {
        console.log("No ID token found, redirecting to login")
        router.push("/login")
        return
      }

      console.log("User authenticated, loading chat data")

      // Wait for token to be ready before making API calls
      await waitForTokenReady()

      try {
        // Load chat history
        await loadChatHistoryData()

        // Check for chat ID in URL
        const chatId = searchParams.get("id")
        if (chatId) {
          await loadChatMessages(chatId)
        } else {
          // Initialize with current chat session or create new one
          const currentSessionId = getCurrentChatSession()
          if (currentSessionId) {
            await loadChatMessages(currentSessionId)
          } else {
            createNewChat()
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try refreshing the page.",
          variant: "destructive",
        })
      } finally {
        setInitialLoadComplete(true)
      }
    }

    if (!initialLoadComplete) {
      initializeChat()
    }
  }, [initialLoadComplete, router, searchParams])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentChat?.messages])

  const loadChatHistoryData = async () => {
    // Add this guard to prevent multiple calls
    if (isLoading) return

    try {
      setIsLoading(true)
      const idToken = getIdToken()
      if (!idToken) return

      // Wait for token to be ready
      await waitForTokenReady()

      const history = await api.getChatHistory(idToken)

      // Convert to our format
      const formattedHistory = history.map((item) => ({
        id: item.chat_session_id,
        title: item.title,
        timestamp: item.timestamp,
        messages: [], // We'll load messages only when needed
      }))

      setChatHistory(formattedHistory)
    } catch (error) {
      console.error("Failed to load chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (!file) {
      return
    }

    // Check file type (PDF or image)
    const fileType = file.type
    const isValidType = fileType === "application/pdf" || fileType.startsWith("image/")

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file only.",
        variant: "destructive",
      })
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      })
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setSelectedFile(file)

    // Upload the file immediately
    try {
      setIsUploading(true)
      const idToken = getIdToken()
      if (!idToken) {
        throw new Error("Not authenticated")
      }

      // Wait for token to be ready
      await waitForTokenReady()

      const uploadResult = await api.uploadFile(file, idToken)
      setUploadedFileId(uploadResult.file_id)

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("File upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload the file. Please try again.",
        variant: "destructive",
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !uploadedFileId) return

    // Ensure we have a chat session
    let chatSessionId = currentChat?.id
    if (!chatSessionId) {
      chatSessionId = generateChatSessionId()
      storeCurrentChatSession(chatSessionId)
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      file: uploadedFileId
        ? {
            id: uploadedFileId,
            name: selectedFile?.name,
            type: selectedFile?.type,
            size: selectedFile?.size,
          }
        : undefined,
    }

    addMessage(userMessage)
    setInput("")
    setIsLoading(true)

    try {
      const idToken = getIdToken()
      if (!idToken) {
        throw new Error("Not authenticated")
      }

      // Wait for token to be ready
      await waitForTokenReady()

      // Prepare request
      const chatRequest = {
        prompt: input,
        chat_options: chatOption,
      }

      if (uploadedFileId) {
        chatRequest.file_id = uploadedFileId
      }

      // Send message to API
      const response = await api.sendChatMessage(chatSessionId, chatRequest, idToken)

      // Add bot response to chat
      const botResponse = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: response.created_at || new Date().toISOString(),
        references: response.references,
      }

      addMessage(botResponse)

      // Clear selected file after processing
      setSelectedFile(null)
      setUploadedFileId(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Refresh chat history to get the updated title
      loadChatHistoryData()
    } catch (error: any) {
      console.error("Chat error:", error)

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLogout = () => {
    clearAuthData()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/login")
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      const idToken = getIdToken()
      if (!idToken) return

      // Call the delete API
      await waitForTokenReady()
      const result = await api.deleteChat(chatId, idToken)

      if (result.success) {
        // Update the local state
        useStore.getState().deleteChat(chatId)

        toast({
          title: "Chat deleted",
          description: "The chat has been removed from your history.",
        })

        // If the current chat was deleted, create a new one
        if (currentChat?.id === chatId) {
          createNewChat()
          // Update URL to remove the deleted chat ID
          router.push("/chat")
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error)
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearAllChats = async () => {
    try {
      const idToken = getIdToken()
      if (!idToken) return

      // Call the clear all API
      await waitForTokenReady()
      const result = await api.clearAllChats(idToken)

      if (result.success) {
        // Update the local state
        useStore.getState().clearAllChats()

        toast({
          title: "All chats cleared",
          description: "Your chat history has been cleared.",
        })

        // Create a new chat
        createNewChat()
        // Update URL to remove any chat ID
        router.push("/chat")
      }
    } catch (error) {
      console.error("Failed to clear chats:", error)
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNewChat = () => {
    // First create the new chat
    createNewChat()

    // Close mobile menu if open
    setIsMobileMenuOpen(false)

    // Force a hard navigation to /chat to clear any query parameters
    // This ensures we properly reset the URL regardless of current state
    window.location.href = "/chat"
  }

  const handleChatOptionChange = (value: string) => {
    setChatOption(value)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <ChatSidebar
            chatHistory={chatHistory}
            onDeleteChat={handleDeleteChat}
            onClearAllChats={handleClearAllChats}
            onLogout={handleLogout}
            onNewChat={handleNewChat}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-[280px] border-r bg-white dark:bg-gray-800 dark:border-gray-700">
        <ChatSidebar
          chatHistory={chatHistory}
          onDeleteChat={handleDeleteChat}
          onClearAllChats={handleClearAllChats}
          onLogout={handleLogout}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between px-4">
          <h1 className="text-xl font-semibold">SPLASHBot</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {currentChat?.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t bg-white dark:bg-gray-800 dark:border-gray-700">
            <Card className="max-w-3xl mx-auto dark:bg-gray-800">
              <div className="p-2">
                <div className="mb-2">
                  <div className="flex items-center">
                    <Select value={chatOption} onValueChange={setChatOption}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select chat option" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHAT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ChatOptionTooltip />
                  </div>
                </div>
                {selectedFile && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedFile.type.includes("pdf") ? (
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
                      )}
                      <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFile(null)
                        setUploadedFileId(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Ask about macroeconomics..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[60px] resize-none dark:bg-gray-700"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isUploading || chatOption !== "General Macroeconomics"}
                    >
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                      <span className="sr-only">Upload file</span>
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="application/pdf,image/*"
                      className="hidden"
                      disabled={chatOption !== "General Macroeconomics"}
                    />
                    <Button
                      size="icon"
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isLoading || isUploading || (!input.trim() && !uploadedFileId)}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      <span className="sr-only">Send message</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
