import { useCallback } from 'react'
import { Button } from './Button'

interface AgentPendingSectionProps {
  gptPrompt: string
  onMarkAsSent: () => void
}

export function AgentPendingSection({
  gptPrompt,
  onMarkAsSent,
}: AgentPendingSectionProps) {
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(gptPrompt)
  }, [gptPrompt])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Prompt</label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {gptPrompt}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={copyToClipboard}>
          Prompt'u Kopyala
        </Button>
        <Button onClick={onMarkAsSent}>
          Agent'a İletildi Olarak İşaretle
        </Button>
      </div>
    </div>
  )
}
