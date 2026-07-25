import { useState } from 'react'
import { Button } from './Button'

interface AgentProcessingSectionProps {
  gptPrompt: string
  onSubmitLog: (log: string) => void
}

export function AgentProcessingSection({
  gptPrompt,
  onSubmitLog,
}: AgentProcessingSectionProps) {
  const [log, setLog] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!log.trim()) return
    onSubmitLog(log.trim())
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 opacity-60">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Gönderilen Prompt</label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {gptPrompt}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Agent'tan Dönen Log
          </label>
          <textarea
            rows={6}
            value={log}
            onChange={(e) => setLog(e.target.value)}
            className="resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Agent çıktısını buraya yapıştırın..."
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Log'u Kaydet ve Orchestrator AI'a Gönder</Button>
        </div>
      </form>
    </div>
  )
}
