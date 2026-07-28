import type { StepStatus } from '../Interfaces/IStep'
import { STEP_STATUS } from '../Interfaces/IStep'
import { useTranslation } from '../hooks/useTranslation'

interface StateBannerProps {
  status: StepStatus
  workflowType?: 'STRICT' | 'FAST_PASS' | 'ITERATIVE'
}

type BannerConfig = Record<
  StepStatus,
  { color: string; icon: string }
>

const config: BannerConfig = {
  [STEP_STATUS.PROMPT_AWAITING]: {
    color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
    icon: 'M12 6v6l4 2',
  },
  [STEP_STATUS.AGENT_PENDING]: {
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  [STEP_STATUS.AGENT_PROCESSING]: {
    color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  [STEP_STATUS.GPT_FEEDBACK_REQUIRED]: {
    color: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
  },
  [STEP_STATUS.COMPLETED]: {
    color: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

function getLabel(status: StepStatus, workflowType: StateBannerProps['workflowType'], t: ReturnType<typeof useTranslation>['t']): string {
  if (status === STEP_STATUS.AGENT_PROCESSING && workflowType === 'ITERATIVE') {
    return t.stateBanner.iterativeProcessing
  }
  const keyMap: Record<StepStatus, keyof typeof t.stateBanner> = {
    [STEP_STATUS.PROMPT_AWAITING]: 'promptAwaiting',
    [STEP_STATUS.AGENT_PENDING]: 'agentPending',
    [STEP_STATUS.AGENT_PROCESSING]: 'agentProcessing',
    [STEP_STATUS.GPT_FEEDBACK_REQUIRED]: 'gptFeedbackRequired',
    [STEP_STATUS.COMPLETED]: 'completed',
  }
  return t.stateBanner[keyMap[status]]
}

export function StateBanner({ status, workflowType }: StateBannerProps) {
  const { t } = useTranslation()
  const { color, icon } = config[status]
  const label = getLabel(status, workflowType, t)

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${color}`}
    >
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      <span>{label}</span>
    </div>
  )
}
