import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

export function ChatOptionTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="h-4 w-4 text-gray-400 cursor-help ml-2" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>Select a chat option to customize the AI&apos;s responses.</p>
          <p className="mt-2 text-xs text-gray-500">Note: File upload is only available for General Macroeconomics.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
