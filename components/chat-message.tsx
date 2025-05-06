import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { FileText, ImageIcon, Bot, User, ExternalLink } from "lucide-react"
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
          <Card className={`p-3 ${isUser ? "bg-blue-50" : "bg-white"}`} data-role={message.role}>
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
                <div className="mt-2 mb-2">
                  <img
                    src={message.file.url || "/placeholder.svg"}
                    alt="Attached image"
                    className="max-w-full rounded-md"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
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
            {!isUser && message.references && message.references.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Referensi:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {message.references.map((reference, index) => (
                    <li key={index} className="flex items-start dark:text-white">
                      <ExternalLink className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                      <a
                        href={reference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 hover:underline truncate"
                        title={reference}
                      >
                        {reference.length > 60 ? `${reference.substring(0, 60)}...` : reference}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
