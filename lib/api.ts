// API client for the FastAPI backend
// import { config } from "dotenv"
// config()

// Base URL for the API
const API_BASE_URL = "http://127.0.0.1:8000"
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API

// Firebase API key for token exchange

export interface SignupRequest {
  email: string
  username: string
  password: string
}

export interface LoginRequest {
  email_or_username: string
  password: string
}

export interface SignupResponse {
  success: boolean
  user_id: string | null
}

export interface LoginResponse {
  success: boolean
  user_id: string | null
  token: string
}

export interface TokenExchangeResponse {
  kind: string
  idToken: string
  refreshToken: string
  expiresIn: string
  isNewUser: boolean
}

export interface ChatRequest {
  prompt: string
  file_id?: string
  chat_options?: string // Add this line
}

export interface ChatResponse {
  response: string
  file_url?: string
}

export interface ChatHistoryItem {
  id: string
  title: string
  timestamp: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  file_id?: string
  timestamp: string
}

// Authentication API
export const api = {
  // User signup
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.status === 201) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Signup failed")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      throw error
    }
  },

  // User login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    }
  },

  // Exchange custom token for ID token
  exchangeToken: async (customToken: string): Promise<TokenExchangeResponse> => {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
          }),
        },
      )

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Token exchange failed")
      }
    } catch (error: any) {
      console.error("Token exchange error:", error)
      throw error
    }
  },

  // Upload file
  uploadFile: async (file: File, idToken: string): Promise<{ file_id: string; url: string }> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      })

      if (response.status === 201) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "File upload failed")
      }
    } catch (error: any) {
      console.error("File upload error:", error)
      throw error
    }
  },

  // Send chat message with session ID
  sendChatMessage: async (sessionId: string, data: ChatRequest, idToken: string): Promise<ChatResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to send message")
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      throw error
    }
  },

  // Get chat history
  getChatHistory: async (idToken: string): Promise<ChatHistoryItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to get chat history")
      }
    } catch (error: any) {
      console.error("Get history error:", error)
      throw error
    }
  },

  // Get chat messages for a specific session
  getChatMessages: async (sessionId: string, idToken: string): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${sessionId}/messages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to get chat messages")
      }
    } catch (error: any) {
      console.error("Get chat messages error:", error)
      throw error
    }
  },

  // Delete chat
  deleteChat: async (chatId: string, idToken: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete chat")
      }
    } catch (error: any) {
      console.error("Delete chat error:", error)
      throw error
    }
  },

  // Clear all chats
  clearAllChats: async (idToken: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to clear chat history")
      }
    } catch (error: any) {
      console.error("Clear history error:", error)
      throw error
    }
  },
}
