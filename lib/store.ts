import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api } from "@/lib/api"
import { getAuthData, saveAuthData, clearAuthData, getIdToken } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid" // Import UUID generation

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
    id?: string
    name?: string
    type?: string
    size?: number
    url?: string
  }
}

export interface ChatSession {
  id: string
  title: string
  timestamp: string
  messages: ChatMessage[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
}

// Add chatOption to the ChatState interface
interface ChatState {
  currentChatId: string | null
  chatSessions: Record<string, ChatSession>
  isLoading: boolean
  chatOption: string // Add this line
  setChatOption: (option: string) => void // Add this line
  setCurrentChatId: (id: string | null) => void
  createNewChat: () => Promise<string>
  addMessage: (chatId: string, message: ChatMessage) => void
  loadChatHistory: () => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  sendMessage: (content: string, file?: File) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  clearAllChats: () => Promise<void>
}

// Auth store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (emailOrUsername: string, password: string) => {
    set({ isLoading: true })
    try {
      // Call login API
      const loginResponse = await api.login({
        email_or_username: emailOrUsername,
        password: password,
      })

      if (loginResponse.success && loginResponse.token) {
        // Exchange custom token for ID token
        const tokenData = await api.exchangeToken(loginResponse.token)

        // Save auth data
        saveAuthData(loginResponse.user_id!, tokenData)

        // Update state
        set({
          user: { id: loginResponse.user_id! },
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        throw new Error("Login failed")
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  signup: async (email: string, username: string, password: string) => {
    set({ isLoading: true })
    try {
      // Call signup API
      const signupResponse = await api.signup({
        email,
        username,
        password,
      })

      if (signupResponse.success) {
        set({ isLoading: false })
      } else {
        throw new Error("Signup failed")
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    // Clear auth data
    clearAuthData()

    // Update state
    set({
      user: null,
      isAuthenticated: false,
    })
  },
}))

// Chat store with persistence
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentChatId: null,
      chatSessions: {},
      isLoading: false,
      chatOption: "General Macroeconomics", // Add this line with default value

      setChatOption: (option) => {
        set({ chatOption: option })
      },

      setCurrentChatId: (id) => {
        // Set the new current chat ID
        set({
          currentChatId: id,
        })
      },

      createNewChat: async () => {
        const idToken = await getIdToken()
        if (!idToken) {
          throw new Error("Not authenticated")
        }

        set({ isLoading: true })
        try {
          // Generate a new UUID for the chat session
          const sessionId = uuidv4()

          // Create a new chat session locally
          const newChat: ChatSession = {
            id: sessionId,
            title: "New Chat",
            timestamp: new Date().toISOString(),
            messages: [
              {
                id: `system-${Date.now()}`,
                role: "system",
                content: "Hello! I'm SPLASHBot, your macroeconomics assistant. How can I help you today?",
                timestamp: new Date().toISOString(),
              },
            ],
          }

          set((state) => ({
            chatSessions: {
              ...state.chatSessions,
              [sessionId]: newChat,
            },
            currentChatId: sessionId,
            isLoading: false,
          }))

          return sessionId
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      addMessage: (chatId, message) =>
        set((state) => {
          // Get the current chat session
          const chatSession = state.chatSessions[chatId]

          if (!chatSession) {
            // Create a new chat session if it doesn't exist
            const newChat: ChatSession = {
              id: chatId,
              title: message.content.slice(0, 30) + (message.content.length > 30 ? "..." : ""),
              timestamp: new Date().toISOString(),
              messages: [message],
            }

            return {
              chatSessions: {
                ...state.chatSessions,
                [chatId]: newChat,
              },
            }
          }

          // Update the chat title if it's the first user message
          let title = chatSession.title
          if (
            chatSession.messages.length === 1 &&
            chatSession.messages[0].role === "system" &&
            message.role === "user"
          ) {
            title = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
          }

          // Add message to existing chat
          const updatedChat = {
            ...chatSession,
            title,
            messages: [...chatSession.messages, message],
            timestamp: new Date().toISOString(), // Update timestamp to current time
          }

          return {
            chatSessions: {
              ...state.chatSessions,
              [chatId]: updatedChat,
            },
          }
        }),

      loadChatHistory: async () => {
        const idToken = await getIdToken()
        if (!idToken) {
          return
        }

        set({ isLoading: true })
        try {
          const history = await api.getChatHistory(idToken)

          // Convert the array of history items to a record of chat sessions
          const chatSessions: Record<string, ChatSession> = {}
          history.forEach((item) => {
            chatSessions[item.id] = {
              id: item.id,
              title: item.title,
              timestamp: item.timestamp,
              messages: [], // Messages will be loaded when the chat is selected
            }
          })

          set({
            chatSessions,
            isLoading: false,
          })

          // If there's no current chat and we have history, set the most recent chat as current
          const state = get()
          if (!state.currentChatId && history.length > 0) {
            // Sort by timestamp (newest first) and get the first item
            const sortedHistory = [...history].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            )
            const mostRecentChatId = sortedHistory[0].id
            set({ currentChatId: mostRecentChatId })
            // Load messages for the most recent chat
            await get().loadChatMessages(mostRecentChatId)
          } else if (!state.currentChatId) {
            // If there's no history, create a new chat with UUID
            await get().createNewChat()
          }
        } catch (error) {
          set({ isLoading: false })
          console.error("Failed to load chat history:", error)
        }
      },

      loadChatMessages: async (chatId) => {
        const idToken = await getIdToken()
        if (!idToken) {
          throw new Error("Not authenticated")
        }

        set({ isLoading: true })
        try {
          const messages = await api.getChatMessages(chatId, idToken)

          // Convert API messages to our format
          const formattedMessages: ChatMessage[] = messages.map((msg) => ({
            id: `${msg.role}-${new Date(msg.timestamp).getTime()}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            file: msg.file_id ? { id: msg.file_id } : undefined,
          }))

          // Update the chat session with messages
          set((state) => {
            const chatSession = state.chatSessions[chatId]
            if (!chatSession) return state

            // Create updated chat sessions with the loaded messages
            const updatedChatSessions = {
              ...state.chatSessions,
              [chatId]: {
                ...chatSession,
                messages: formattedMessages,
              },
            }

            return {
              chatSessions: updatedChatSessions,
              currentChatId: chatId, // Ensure the current chat ID is set correctly
              isLoading: false,
            }
          })
        } catch (error) {
          set({ isLoading: false })
          console.error(`Failed to load messages for chat ${chatId}:`, error)
          throw error // Re-throw to allow handling in the UI
        }
      },

      sendMessage: async (content, file) => {
        const idToken = await getIdToken()
        if (!idToken) {
          throw new Error("Not authenticated")
        }

        // Get or create a chat session with UUID
        let chatId = get().currentChatId
        if (!chatId) {
          chatId = await get().createNewChat()
        }

        set({ isLoading: true })

        try {
          // Create user message
          const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content,
            timestamp: new Date().toISOString(),
          }

          // Upload file if provided
          let fileId: string | undefined
          if (file) {
            const uploadResponse = await api.uploadFile(file, idToken)
            fileId = uploadResponse.file_id

            // Add file info to user message
            userMessage.file = {
              id: fileId,
              name: file.name,
              type: file.type,
              size: file.size,
              url: uploadResponse.url,
            }
          }

          // Add user message to chat
          get().addMessage(chatId, userMessage)

          // Send message to API with the chat session ID and chat option
          const chatResponse = await api.sendChatMessage(
            chatId,
            {
              prompt: content,
              file_id: fileId,
              chat_options: get().chatOption, // Add this line to include the chat option
            },
            idToken,
          )

          // Create assistant message
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: chatResponse.response,
            timestamp: new Date().toISOString(),
            file: chatResponse.file_url ? { url: chatResponse.file_url } : undefined,
          }

          // Add assistant message to chat
          get().addMessage(chatId, assistantMessage)

          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteChat: async (chatId) => {
        const idToken = await getIdToken()
        if (!idToken) {
          throw new Error("Not authenticated")
        }

        set({ isLoading: true })
        try {
          await api.deleteChat(chatId, idToken)

          set((state) => {
            // Create a new chat sessions object without the deleted chat
            const { [chatId]: deletedChat, ...remainingChats } = state.chatSessions

            // If the deleted chat was the current chat, set currentChatId to null
            const newCurrentChatId = state.currentChatId === chatId ? null : state.currentChatId

            return {
              chatSessions: remainingChats,
              currentChatId: newCurrentChatId,
              isLoading: false,
            }
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      clearAllChats: async () => {
        const idToken = await getIdToken()
        if (!idToken) {
          throw new Error("Not authenticated")
        }

        set({ isLoading: true })
        try {
          await api.clearAllChats(idToken)

          set({
            chatSessions: {},
            currentChatId: null,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
    }),
    {
      name: "splashbot-chat-storage",
      partialize: (state) => ({
        chatSessions: state.chatSessions,
        currentChatId: state.currentChatId,
        chatOption: state.chatOption, // Add this line to persist the chat option
      }),
    },
  ),
)

// Initialize auth state from local storage
export const initializeAuthState = () => {
  const authData = getAuthData()
  if (authData) {
    useAuthStore.setState({
      user: { id: authData.userId },
      isAuthenticated: true,
    })
  }
}
