import { useCallback } from 'react'
import { Button } from './Button'
import { useTranslation } from '../hooks/useTranslation'

interface AgentPendingSectionProps {
  gptPrompt: string
  onMarkAsSent: () => void
  workflowType?: 'STRICT' | 'FAST_PASS' | 'ITERATIVE'
  onCompleteCycle?: () => void
}

export function AgentPendingSection({
  gptPrompt,
  onMarkAsSent,
  workflowType,
  onCompleteCycle,
}: AgentPendingSectionProps) {
  const { t } = useTranslation()
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(gptPrompt)
  }, [gptPrompt])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t.agentPending.promptLabel}</label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {gptPrompt}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={copyToClipboard}>
          {t.agentPending.copyPrompt}
        </Button>
        <Button onClick={onMarkAsSent}>
          {t.agentPending.markAsSent}
        </Button>
        {workflowType === 'ITERATIVE' && onCompleteCycle && (
          <Button variant="primary" onClick={onCompleteCycle}>
            {t.agentPending.completeCycle}
          </Button>
        )}
      </div>
    </div>
  )
}
