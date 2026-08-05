export const STEP_STATUS = {
  PROMPT_AWAITING: 'PROMPT_AWAITING',
  AGENT_PENDING: 'AGENT_PENDING',
  AGENT_PROCESSING: 'AGENT_PROCESSING',
  LLM_FEEDBACK_REQUIRED: 'LLM_FEEDBACK_REQUIRED',
  COMPLETED: 'COMPLETED',
} as const

export type StepStatus = typeof STEP_STATUS[keyof typeof STEP_STATUS]

export interface IIterationCycle {
  cycleId: string
  timestamp: number
  prompt: string
  agentLog: string
  notes?: string
}

export interface IStep {
  id: string
  title?: string
  phase: number
  step: number
  hasPhaseStep?: boolean
  prompt: string | null
  agentLog: string | null
  status: StepStatus
  createdAt: string
  updatedAt: string
  sourceAI?: string
  targetAgent?: string
  agentModel?: string
  workflowType?: 'STRICT' | 'FAST_PASS' | 'ITERATIVE'
  iterationHistory?: IIterationCycle[]
  tags?: string[]
}
