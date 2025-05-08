import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { FileText, ImageIcon, ExternalLink, Bot, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import SafeClientOnly from "@/components/safe-client-only"
import type { ChatMessage as ChatMessageType } from "@/lib/store"

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} gap-3 max-w-[80%]`}>
        <Avatar className={`h-8 w-8 ${isUser ? "bg-blue-500" : "bg-green-500"} flex items-center justify-center`}>
          {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
        </Avatar>
        <div className="w-full overflow-hidden">
          <Card className={`p-3 ${isUser ? "bg-blue-50 dark:bg-blue-900" : "bg-white dark:bg-gray-800"}`}>
            {message.file && (
              <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center">
                {message.file.type?.includes("pdf") ? (
                  <FileText className="h-4 w-4 text-blue-500 mr-2" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-blue-500 mr-2" />
                )}
                <span className="text-xs truncate max-w-[200px]">
                  {message.file.name} {message.file.size && `(${(message.file.size / 1024).toFixed(2)} KB)`}
                </span>
              </div>
            )}
            <div className="w-full break-words">
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert overflow-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      // Override pre to add scrolling for code blocks
                      pre: ({ node, ...props }) => (
                        <pre className="overflow-x-auto p-4 bg-gray-100 dark:bg-gray-900 rounded-md my-4" {...props} />
                      ),
                      // Override code to ensure inline code doesn't break layout
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-sm" {...props} />
                        ) : (
                          <code {...props} />
                        ),
                      // Ensure tables can scroll horizontally
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto">
                          <table className="border-collapse border border-gray-300 dark:border-gray-700" {...props} />
                        </div>
                      ),
                      // Make sure links don't overflow
                      a: ({ node, ...props }) => (
                        <a className="text-blue-600 dark:text-blue-400 break-all" {...props} />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* References section */}
            {message.references && message.references.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">References:</p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  {message.references.map((ref, index) => (
                    <li key={index} className="flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1 inline flex-shrink-0" />
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:underline break-all"
                      >
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          <SafeClientOnly fallback={<div className="text-xs text-gray-500 mt-1 px-1">Loading time...</div>}>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </div>
          </SafeClientOnly>
        </div>
      </div>
    </div>
  )
}
