import { useState } from 'react'
import type { IStep } from '../Interfaces/IStep'
import { STEP_STATUS } from '../Interfaces/IStep'
import { resolveStepTitle } from '../utils/stepTitle'
import { useTranslation } from '../hooks/useTranslation'

interface ActiveTasksDrawerProps {
  activeSteps: IStep[]
  focusedStepId: string | null
  onSelect: (id: string) => void
  onNewSession: () => void
}

const STATUS_LABEL: Record<string, string> = {
  [STEP_STATUS.PROMPT_AWAITING]: 'Draft',
  [STEP_STATUS.AGENT_PENDING]: 'Awaiting Agent Log',
  [STEP_STATUS.AGENT_PROCESSING]: 'Processing',
  [STEP_STATUS.LLM_FEEDBACK_REQUIRED]: 'Awaiting LLM Feedback',
  [STEP_STATUS.COMPLETED]: 'Completed',
}

const STATUS_COLOR: Record<string, string> = {
  [STEP_STATUS.PROMPT_AWAITING]: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',
  [STEP_STATUS.AGENT_PENDING]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  [STEP_STATUS.AGENT_PROCESSING]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  [STEP_STATUS.LLM_FEEDBACK_REQUIRED]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  [STEP_STATUS.COMPLETED]: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export function ActiveTasksDrawer({
  activeSteps,
  focusedStepId,
  onSelect,
  onNewSession,
}: ActiveTasksDrawerProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex-none flex flex-col border-t border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
          disabled={activeSteps.length === 0}
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{t.drawer.title}</span>
          {activeSteps.length > 0 && (
            <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-slate-700 dark:text-slate-300">
              {activeSteps.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onNewSession}
          className="cursor-pointer rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-700"
        >
          {t.drawer.newSession}
        </button>
      </div>

      {expanded && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 min-h-0">
          {activeSteps.length === 0 ? (
            <p className="py-1 text-xs text-gray-400 dark:text-slate-500">{t.drawer.empty}</p>
          ) : (
            activeSteps.map((s) => {
              const isFocused = s.id === focusedStepId
              return (
                <button
                  key={s.id}
                  type="button"
                  data-status={s.status}
                  onClick={() => onSelect(s.id)}
                  className={`group flex min-w-44 cursor-pointer flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors ${
                    isFocused
                      ? 'border-green-500 bg-green-50 dark:border-green-500 dark:bg-slate-800'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                  }`}
                >
                  <span
                    className={`self-start rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      STATUS_COLOR[s.status] ?? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  <span className="truncate text-xs font-medium text-gray-900 dark:text-slate-100">
                    {resolveStepTitle(s) || t.common.untitled}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
