"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Loader2, Send, Upload, FileText, ImageIcon, Menu, X, LogOut, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import ChatMessage from "@/components/chat-message"
import ChatSidebar from "@/components/chat-sidebar"
import { useAuthStore, useChatStore } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add import for ChatOptionTooltip
import { ChatOptionTooltip } from "@/components/chat-option-tooltip"

// Update the ChatPage component to include chat options
export default function ChatPage() {
  const [input, setInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Auth store
  const { isAuthenticated, logout } = useAuthStore()

  // Chat store
  const {
    currentChatId,
    chatSessions,
    isLoading,
    chatOption,
    setChatOption,
    createNewChat,
    sendMessage,
    deleteChat,
    clearAllChats,
    loadChatHistory,
    loadChatMessages,
    setCurrentChatId,
  } = useChatStore()

  // Define chat options
  const chatOptions = [
    "General Macroeconomics",
    "2 Wheels",
    "4 Wheels",
    "Retail General",
    "Retail Beauty",
    "Retail FnB",
    "Retail Drugstore",
  ]

  // Check if file upload should be disabled
  const isFileUploadDisabled = chatOption !== "General Macroeconomics"

  // Check authentication and load chat history
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      // Load chat history
      loadChatHistory()
    }
  }, [isAuthenticated, router, loadChatHistory])

  // Get current chat session
  const currentChat = currentChatId ? chatSessions[currentChatId] : null

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentChat?.messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    toast({
      title: "File selected",
      description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    })
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return

    try {
      // Send message using chat store
      await sendMessage(input, selectedFile || undefined)

      // Clear input and selected file
      setInput("")
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/login")
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      toast({
        title: "Chat deleted",
        description: "The chat has been removed from your history.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearAllChats = async () => {
    try {
      await clearAllChats()
      toast({
        title: "All chats cleared",
        description: "Your chat history has been cleared.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear chat history. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNewChat = async () => {
    try {
      // Generate a new UUID for the chat session and create a new chat
      await createNewChat()
      toast({
        title: "New chat created",
        description: "You can start a new conversation.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create new chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectChat = async (chatId: string) => {
    try {
      // If the chat has no messages, load them
      const chat = chatSessions[chatId]
      if (chat && (!chat.messages || chat.messages.length === 0)) {
        await loadChatMessages(chatId)
      }

      // Update the current chat ID to switch to the selected chat
      setCurrentChatId(chatId)

      // Close mobile menu when selecting a chat
      setIsMobileMenuOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Default welcome message if no current chat
  const messages =
    currentChatId && chatSessions[currentChatId]?.messages?.length > 0
      ? chatSessions[currentChatId].messages
      : [
          {
            id: "system-1",
            role: "system" as "system",
            content: "Hello! I'm SPLASHBot, your macroeconomics assistant. How can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ]

  // Convert chat sessions to array for sidebar and sort by timestamp (newest first)
  const chatHistoryArray = Object.values(chatSessions).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="flex h-screen bg-gray-50">
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
            chatHistory={chatHistoryArray}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onClearAllChats={handleClearAllChats}
            onLogout={handleLogout}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-[280px] border-r bg-white">
        <ChatSidebar
          chatHistory={chatHistoryArray}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onClearAllChats={handleClearAllChats}
          onLogout={handleLogout}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">{currentChat ? currentChat.title : "SPLASHBot"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleNewChat} title="New Chat">
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t bg-white">
            <Card className="max-w-3xl mx-auto">
              <div className="p-2">
                {/* Chat options dropdown */}
                <div className="mb-2">
                  <div className="flex items-center">
                    <Select value={chatOption} onValueChange={setChatOption}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select chat option" />
                      </SelectTrigger>
                      <SelectContent>
                        {chatOptions.map((option) => (
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
                  <div className="mb-2 p-2 bg-blue-50 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedFile.type.includes("pdf") ? (
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
                      )}
                      <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="h-6 w-6">
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
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isFileUploadDisabled}
                      title={
                        isFileUploadDisabled
                          ? "File upload is only available for General Macroeconomics"
                          : "Upload file"
                      }
                    >
                      <Upload className="h-5 w-5" />
                      <span className="sr-only">Upload file</span>
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="application/pdf,image/*"
                      className="hidden"
                      disabled={isFileUploadDisabled}
                    />
                    <Button
                      size="icon"
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isLoading || (!input.trim() && !selectedFile)}
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
