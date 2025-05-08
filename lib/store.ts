import { create } from "zustand"
import {
  getIdToken,
  getUserId,
  generateChatSessionId,
  storeCurrentChatSession,
  getCurrentChatSession,
  waitForTokenReady,
} from "./auth"
import { api } from "./api"

interface User {
  id: string
  email?: string
  username?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  file?: {
    name?: string
    type?: string
    size?: number
    url?: string
    id?: string
  }
  references?: string[]
}

export interface ChatSession {
  id: string
  title: string
  timestamp: string
  messages: ChatMessage[]
}

interface AppState {
  user: User | null
  currentChat: ChatSession | null
  chatHistory: ChatSession[]
  isAuthenticated: boolean
  isLoading: boolean
  chatOption: string

  // Actions
  setUser: (user: User | null) => void
  setCurrentChat: (chat: ChatSession | null) => void
  addMessage: (message: ChatMessage) => void
  setChatHistory: (history: ChatSession[]) => void
  deleteChat: (chatId: string) => void
  clearAllChats: () => void
  setIsLoading: (isLoading: boolean) => void
  createNewChat: () => void
  setChatOption: (option: string) => void
  loadChatMessages: (chatSessionId: string) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  user: { id: getUserId() || "" },
  currentChat: null,
  chatHistory: [],
  isAuthenticated: !!getUserId(),
  isLoading: false,
  chatOption: "General Macroeconomics",

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setCurrentChat: (chat) => set({ currentChat: chat }),

  addMessage: (message) =>
    set((state) => {
      if (!state.currentChat) {
        // Create a new chat if none exists
        const newChat = {
          id: getCurrentChatSession() || generateChatSessionId(),
          title: message.content.slice(0, 30) + (message.content.length > 30 ? "..." : ""),
          timestamp: new Date().toISOString(),
          messages: [message],
        }

        storeCurrentChatSession(newChat.id)

        return {
          currentChat: newChat,
          chatHistory: [newChat, ...state.chatHistory],
        }
      }

      // Add message to existing chat
      const updatedChat = {
        ...state.currentChat,
        messages: [...state.currentChat.messages, message],
      }

      // Update chat history
      const updatedHistory = state.chatHistory.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))

      return {
        currentChat: updatedChat,
        chatHistory: updatedHistory,
      }
    }),

  setChatHistory: (history) => set({ chatHistory: history }),

  deleteChat: (chatId) =>
    set((state) => {
      const updatedHistory = state.chatHistory.filter((chat) => chat.id !== chatId)

      // If the current chat is being deleted, set currentChat to null
      const updatedCurrentChat = state.currentChat?.id === chatId ? null : state.currentChat

      return {
        chatHistory: updatedHistory,
        currentChat: updatedCurrentChat,
      }
    }),

  clearAllChats: () =>
    set({
      chatHistory: [],
      currentChat: null,
    }),

  setIsLoading: (isLoading) => set({ isLoading }),

  createNewChat: () => {
    const newChatId = generateChatSessionId()
    storeCurrentChatSession(newChatId)

    set({
      currentChat: {
        id: newChatId,
        title: "New Conversation",
        timestamp: new Date().toISOString(),
        messages: [
          {
            id: "system-welcome",
            role: "system",
            content: "Hello! I'm SPLASHBot, your macroeconomics assistant. How can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    })
  },

  setChatOption: (option) => set({ chatOption: option }),

  loadChatMessages: async (chatSessionId) => {
    // Add this guard to prevent multiple calls
    if (get().isLoading) return

    try {
      set({ isLoading: true })
      const idToken = getIdToken()

      if (!idToken) {
        throw new Error("Not authenticated")
      }

      // Wait for token to be ready
      await waitForTokenReady()

      const messages = await api.getChatMessages(chatSessionId, idToken)

      // Convert API messages to our format
      const formattedMessages: ChatMessage[] = messages.map((msg) => ({
        id: msg.message_id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        file: msg.file_id ? { id: msg.file_id } : undefined,
        references: msg.references,
      }))

      // Create chat session
      const chatSession: ChatSession = {
        id: chatSessionId,
        title:
          formattedMessages.length > 0 && formattedMessages[0].role === "user"
            ? formattedMessages[0].content.slice(0, 30) + (formattedMessages[0].content.length > 30 ? "..." : "")
            : "Conversation",
        timestamp: formattedMessages.length > 0 ? formattedMessages[0].timestamp : new Date().toISOString(),
        messages:
          formattedMessages.length > 0
            ? formattedMessages
            : [
                {
                  id: "system-welcome",
                  role: "system",
                  content: "Hello! I'm SPLASHBot, your macroeconomics assistant. How can I help you today?",
                  timestamp: new Date().toISOString(),
                },
              ],
      }

      set({ currentChat: chatSession })
      storeCurrentChatSession(chatSessionId)
    } catch (error) {
      console.error("Error loading chat messages:", error)
    } finally {
      set({ isLoading: false })
    }
  },
}))
