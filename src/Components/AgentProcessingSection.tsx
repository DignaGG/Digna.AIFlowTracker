import { useCallback, useState } from 'react'
import { Button } from './Button'
import { useTranslation } from '../hooks/useTranslation'
import { textareaCls } from '../styles/formClasses'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)

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

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (typeof e.currentTarget.form?.requestSubmit === 'function') {
          e.currentTarget.form.requestSubmit()
        }
      }
    },
    [],
  )

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
            onKeyDown={handleTextareaKeyDown}
            className={textareaCls}
            placeholder={t.agentProcessing.logPlaceholder}
            required
          />
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px]">
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-semibold rounded border border-slate-700 bg-slate-800 text-slate-300 shadow-sm">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            +
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-semibold rounded border border-slate-700 bg-slate-800 text-slate-300 shadow-sm">
              Enter
            </kbd>
          </span>
          <Button type="submit">{t.agentProcessing.submitLog}</Button>
        </div>
      </form>
    </div>
  )
}
