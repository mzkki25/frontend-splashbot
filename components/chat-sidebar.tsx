"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, LogOut, X, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import SafeClientOnly from "@/components/safe-client-only"
import type { ChatSession } from "@/lib/store"

interface ChatSidebarProps {
  chatHistory: ChatSession[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onClearAllChats: () => void
  onLogout: () => void
  onClose?: () => void
}

export default function ChatSidebar({
  chatHistory,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearAllChats,
  onLogout,
  onClose,
}: ChatSidebarProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Chat History</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button className="w-full flex items-center gap-2" onClick={onNewChat}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History List */}
      <ScrollArea className="flex-1 px-4">
        {chatHistory.length > 0 ? (
          <div className="space-y-2 py-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`relative rounded-md transition-colors ${
                  currentChatId === chat.id ? "bg-blue-100 dark:text-black" : "hover:bg-blue-100 dark:hover:text-black"
                }`}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="p-3 pr-10 cursor-pointer">
                  <div className="font-medium truncate">{chat.title}</div>
                  <SafeClientOnly fallback={<div className="text-xs text-gray-500">Loading date...</div>}>
                    <div className="text-xs light:text-gray-500 dark:text-gray-100">
                      {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                    </div>
                  </SafeClientOnly>
                </div>
                {(hoveredChatId === chat.id || currentChatId === chat.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(chat.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No chat history yet</div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t mt-auto space-y-2">
        {chatHistory.length > 0 && (
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onClearAllChats}
          >
            Clear All Chats
          </Button>
        )}
        <Button variant="outline" className="w-full" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
