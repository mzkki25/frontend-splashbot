// Real API client for the FastAPI backend

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API
const API_BASE_URL = "http://127.0.0.1:8000"

export interface ChatRequest {
  prompt: string
  file_id?: string
  chat_options?: string
  userId?: string
}

export interface ChatResponse {
  response: string
  file_url?: string
  created_at: string
  references: string[]
}

export interface UploadResponse {
  success: boolean
  file_id: string
  url: string
}

export interface ChatHistoryItem {
  chat_session_id: string
  title: string
  timestamp: string
}

export interface ChatMessage {
  message_id: string
  chat_session_id: string
  role: "user" | "assistant"
  content: string
  file_id?: string
  timestamp: string
  references?: string[]
}

export interface AuthResponse {
  success: boolean
  user_id?: string
  token?: string
}

export interface TokenExchangeResponse {
  kind: string
  idToken: string
  refreshToken: string
  expiresIn: string
  isNewUser: boolean
}

// Helper function to handle token timing errors
const handleTokenTimingError = async (error: any) => {
  // Check if this is a "token used too early" error
  if (error.message && error.message.includes("Token used too early")) {
    console.log("Token timing error detected, waiting before retry...")
    // Wait for 2 seconds and suggest retry
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return true
  }
  return false
}

export const api = {
  // Authentication
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      })

      if (response.status === 201) {
        return await response.json()
      } else {
        const errorData = await response.text()
        throw new Error(errorData || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  login: async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_or_username: emailOrUsername,
          password,
        }),
      })

      const data = await response.json()

      if (response.status === 200) {
        return data
      } else {
        console.error("Login failed with status:", response.status, data)
        throw new Error(data.detail || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  exchangeToken: async (customToken: string): Promise<TokenExchangeResponse> => {
    try {
      console.log("Exchanging token:", customToken)
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

      const data = await response.json()

      if (response.status === 200) {
        return data
      } else {
        console.error("Token exchange failed:", data)
        throw new Error(data.error?.message || "Token exchange failed")
      }
    } catch (error) {
      console.error("Token exchange error:", error)
      throw error
    }
  },

  // Chat
  sendChatMessage: async (chatSessionId: string, request: ChatRequest, accessToken: string): Promise<ChatResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${chatSessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.text()
        throw new Error(errorData || "Failed to send message")
      }
    } catch (error) {
      console.error("Chat error:", error)

      // Check for token timing error and retry if needed
      if (await handleTokenTimingError(error)) {
        return api.sendChatMessage(chatSessionId, request, accessToken)
      }

      throw error
    }
  },

  // File Upload
  uploadFile: async (file: File, accessToken: string): Promise<UploadResponse> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (response.status === 201) {
        return await response.json()
      } else {
        const errorData = await response.text()
        throw new Error(errorData || "File upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)

      // Check for token timing error and retry if needed
      if (await handleTokenTimingError(error)) {
        return api.uploadFile(file, accessToken)
      }

      throw error
    }
  },

  // Chat History
  getChatHistory: async (accessToken: string): Promise<ChatHistoryItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorText = await response.text()
        console.error("History error status:", response.status, errorText)
        throw new Error(errorText || "Failed to get chat history")
      }
    } catch (error) {
      console.error("History error:", error)

      // Check for token timing error and retry if needed
      if (await handleTokenTimingError(error)) {
        return api.getChatHistory(accessToken)
      }

      throw error
    }
  },

  // Chat Messages by Session ID
  getChatMessages: async (chatSessionId: string, accessToken: string): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatSessionId}/messages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.text()
        throw new Error(errorData || "Failed to get chat messages")
      }
    } catch (error) {
      console.error("Messages error:", error)

      // Check for token timing error and retry if needed
      if (await handleTokenTimingError(error)) {
        return api.getChatMessages(chatSessionId, accessToken)
      }

      throw error
    }
  },

  // Delete a specific chat - FIXED: Added /chat to the endpoint path
  deleteChat: async (chatId: string, accessToken: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.text()
        console.error("Delete chat error status:", response.status, errorData)
        throw new Error(errorData || "Failed to delete chat")
      }
    } catch (error) {
      console.error("Delete chat error:", error)

      // Check for token timing error and retry if needed
      if (await handleTokenTimingError(error)) {
        return api.deleteChat(chatId, accessToken)
      }

      throw error
    }
  },

  // Clear all chats - FIXED: Added /chat to the endpoint path
  clearAllChats: async (accessToken: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        return await response.json()
      } else {
        const errorData = await response.text()
        console.error("Clear all chats error status:", response.status, errorData)
        throw new Error(errorData || "Failed to clear all chats")
      }
    } catch (error) {
      console.error("Clear all chats error:", error)

      // Check for token timing error and retry if needed
      if (await handleTokenTimingError(error)) {
        return api.clearAllChats(accessToken)
      }

      throw error
    }
  },
}
