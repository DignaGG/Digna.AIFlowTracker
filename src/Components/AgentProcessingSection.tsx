import { useState } from 'react'
import { Button } from './Button'
import { useTranslation } from '../hooks/useTranslation'
import { textareaCls } from '../styles/formClasses'

interface AgentProcessingSectionProps {
  prompt: string
  onSubmitLog: (log: string) => void
}

export function AgentProcessingSection({
  prompt,
  onSubmitLog,
}: AgentProcessingSectionProps) {
  const { t } = useTranslation()
  const [log, setLog] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!log.trim()) return
    onSubmitLog(log.trim())
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 opacity-60">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t.agentProcessing.sentPromptLabel}</label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {prompt}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {t.agentProcessing.agentLogLabel}
          </label>
          <textarea
            rows={6}
            value={log}
            onChange={(e) => setLog(e.target.value)}
            className={textareaCls}
            placeholder={t.agentProcessing.logPlaceholder}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">{t.agentProcessing.submitLog}</Button>
        </div>
      </form>
    </div>
  )
}
