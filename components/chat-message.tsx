import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { FileText, ImageIcon, Bot, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import SafeClientOnly from "@/components/safe-client-only"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import type { ChatMessage as ChatMessageType } from "@/lib/store"

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} gap-3 max-w-[80%]`}>
        <Avatar className={`h-8 w-8 ${isUser ? "bg-blue-500" : "bg-green-500"} flex items-center justify-center`}>
          {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
        </Avatar>
        <div>
          <Card className={`p-3 ${isUser ? "bg-blue-50" : "bg-white"}`}>
            {message.file && (
              <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center">
                {message.file.type?.includes("pdf") || message.file.name?.endsWith(".pdf") ? (
                  <FileText className="h-4 w-4 text-blue-500 mr-2" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-blue-500 mr-2" />
                )}
                <span className="text-xs truncate max-w-[200px]">
                  {message.file.name || "Attached file"}
                  {message.file.size && ` (${(message.file.size / 1024).toFixed(2)} KB)`}
                </span>
              </div>
            )}
            {message.file?.url &&
              (message.file.type?.includes("image") || message.file.url.match(/\.(jpeg|jpg|gif|png)$/i)) && (
                <div className="mt-2 mb-2"></div>
              )}
            <div className="w-full">
              {isUser ? (
                message.content
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </Card>
          <SafeClientOnly fallback={<div className="text-xs text-gray-500 mt-1 px-1">Loading time...</div>}>
            <div className="text-xs text-gray-500 mt-1 px-1">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </div>
          </SafeClientOnly>
        </div>
      </div>
    </div>
  )
}
