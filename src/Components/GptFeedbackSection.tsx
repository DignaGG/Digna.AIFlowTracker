import { useCallback } from 'react'
import { Button } from './Button'

interface GptFeedbackSectionProps {
  agentLog: string
  onCompleteCycle: () => void
}

export function GptFeedbackSection({
  agentLog,
  onCompleteCycle,
}: GptFeedbackSectionProps) {
  const copyLogToClipboard = useCallback(() => {
    navigator.clipboard.writeText(agentLog)
  }, [agentLog])

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-5 text-center dark:border-red-700 dark:bg-red-900/30">
        <div className="mb-2 flex justify-center">
          <svg
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
          Bekleyen Eylem: Agent Logunu Kopyala, Orchestrator AI'a Geri Besleme Yap!
        </h3>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Log'u alıp Orchestrator AI'a geri besleme yapmadan döngü ilerleyemez.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Agent Logu</label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {agentLog}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={copyLogToClipboard}>
          Log'u Kopyala
        </Button>
        <Button onClick={onCompleteCycle}>
          Orchestrator AI'a Verildi, Döngüyü Bitir
        </Button>
      </div>
    </div>
  )
}
