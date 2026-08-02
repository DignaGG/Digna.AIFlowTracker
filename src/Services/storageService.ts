import type { IStep } from '../Interfaces/IStep'
import { STEP_STATUS } from '../Interfaces/IStep'
import {
  encryptData,
  decryptData,
  DecryptionError,
  isEncryptionActive,
  isEncryptedBlob,
} from './cryptoService'

export { DecryptionError }

const STORAGE_KEY = 'pipeline-steps'

function migrateStep(step: Record<string, unknown>): IStep {
  return {
    ...step,
    workflowType: step.workflowType ?? 'STRICT',
    tags: step.tags ?? [],
  } as IStep
}

async function getAllStepsRaw(): Promise<IStep[]> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (isEncryptedBlob(parsed)) {
      const plainText = await decryptData(parsed)
      return (JSON.parse(plainText) as Record<string, unknown>[]).map(migrateStep)
    }
    if (Array.isArray(parsed)) {
      return parsed.map(migrateStep)
    }
    return []
  } catch {
    throw new DecryptionError()
  }
}

async function persistSteps(steps: IStep[]): Promise<void> {
  const plainText = JSON.stringify(steps)
  if (isEncryptionActive()) {
    const encrypted = await encryptData(plainText)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted))
  } else {
    localStorage.setItem(STORAGE_KEY, plainText)
  }
}

export async function getActiveStep(): Promise<IStep | null> {
  const steps = await getAllStepsRaw()
  return steps.find((s) => s.status !== STEP_STATUS.COMPLETED) ?? null
}

export async function getArchivedSteps(): Promise<IStep[]> {
  const steps = await getAllStepsRaw()
  return steps.filter((s) => s.status === STEP_STATUS.COMPLETED)
}

export async function getAllSteps(): Promise<{ active: IStep | null; archived: IStep[] }> {
  const steps = await getAllStepsRaw()
  const active = steps.find((s) => s.status !== STEP_STATUS.COMPLETED) ?? null
  const archived = steps.filter((s) => s.status === STEP_STATUS.COMPLETED)
  return { active, archived }
}

export async function createStep(data: {
  title?: string
  phase: number
  step: number
  gptPrompt: string
  workflowType?: 'STRICT' | 'FAST_PASS' | 'ITERATIVE'
  sourceAI?: string
  targetAgent?: string
  agentModel?: string
  hasPhaseStep?: boolean
  tags?: string[]
}): Promise<IStep> {
  const steps = await getAllStepsRaw()
  const now = new Date().toISOString()
  const step: IStep = {
    id: crypto.randomUUID(),
    title: data.title,
    phase: data.phase,
    step: data.step,
    gptPrompt: data.gptPrompt,
    agentLog: null,
    status: STEP_STATUS.PROMPT_AWAITING,
    createdAt: now,
    updatedAt: now,
    ...(data.workflowType && { workflowType: data.workflowType }),
    ...(data.sourceAI && { sourceAI: data.sourceAI }),
    ...(data.targetAgent && { targetAgent: data.targetAgent }),
    ...(data.agentModel && { agentModel: data.agentModel }),
    ...(data.hasPhaseStep === true && { hasPhaseStep: true }),
    ...(data.tags && { tags: data.tags }),
  }
  steps.push(step)
  await persistSteps(steps)
  return step
}

export async function deleteStep(id: string): Promise<void> {
  const steps = await getAllStepsRaw()
  const filtered = steps.filter((s) => s.id !== id)
  await persistSteps(filtered)
}

export async function updateStep(
  id: string,
  data: Partial<IStep>,
): Promise<IStep | null> {
  const steps = await getAllStepsRaw()
  const index = steps.findIndex((s) => s.id === id)
  if (index === -1) return null
  steps[index] = {
    ...steps[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  await persistSteps(steps)
  return steps[index]
}
