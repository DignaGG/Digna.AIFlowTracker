import type { IStep, IIterationCycle } from '../Interfaces/IStep'
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
const PERSIST_DEBOUNCE_MS = 400
const EXPORT_VERSION = '0.5.0'
const EXPORT_APP = 'Digna.AIFlowTracker'

const LEGACY_GPT_STATUS: string = 'GPT_FEEDBACK_REQUIRED'
const LLM_STATUS: string = STEP_STATUS.LLM_FEEDBACK_REQUIRED

let latestSnapshot: IStep[] | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let writeChain: Promise<void> = Promise.resolve()

function migrateStep(step: Record<string, unknown>): IStep {
  return {
    ...step,
    prompt: step.prompt ?? step.gptPrompt ?? null,
    status: step.status === LEGACY_GPT_STATUS ? LLM_STATUS : step.status,
    workflowType: step.workflowType ?? 'STRICT',
    tags: step.tags ?? [],
    iterationHistory: Array.isArray(step.iterationHistory) ? step.iterationHistory : [],
  } as IStep
}

async function getAllStepsRaw(): Promise<IStep[]> {
  if (latestSnapshot !== null) return [...latestSnapshot]
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

async function persistNow(steps: IStep[]): Promise<void> {
  const plainText = JSON.stringify(steps)
  if (isEncryptionActive()) {
    const encrypted = await encryptData(plainText)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted))
  } else {
    localStorage.setItem(STORAGE_KEY, plainText)
  }
}

function schedulePersist(steps: IStep[]): void {
  latestSnapshot = steps
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer)
  }
  debounceTimer = window.setTimeout(() => {
    debounceTimer = null
    void flushPendingPersists()
  }, PERSIST_DEBOUNCE_MS)
}

export function flushPendingPersists(): Promise<void> {
  const snapshot = latestSnapshot
  if (snapshot === null) return writeChain
  writeChain = writeChain.then(() => persistNow(snapshot))
  return writeChain
}

function flushPendingSync(): void {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer)
    debounceTimer = null
  }
  if (latestSnapshot === null) return
  if (isEncryptionActive()) {
    void flushPendingPersists()
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(latestSnapshot))
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushPendingSync()
  })
}

const ARCHIVED_STATUS: string = 'ARCHIVED'

const isActiveStep = (s: IStep): boolean =>
  s.status !== STEP_STATUS.COMPLETED && s.status !== ARCHIVED_STATUS

export interface IExportEnvelope {
  version: string
  exportedAt: string
  app: string
  payload: IStep[]
}

export async function exportAllDataAsJson(): Promise<IExportEnvelope> {
  const steps = await getAllStepsRaw()
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: EXPORT_APP,
    payload: steps,
  }
}

export async function getActiveSteps(key?: CryptoKey): Promise<IStep[]> {
  if (key !== undefined && !(key instanceof CryptoKey)) {
    throw new Error('getActiveSteps: geçerli bir CryptoKey gerekli (Zero-Knowledge guard)')
  }
  const steps = await getAllStepsRaw()
  return steps.filter(isActiveStep)
}

export async function getArchivedSteps(): Promise<IStep[]> {
  const steps = await getAllStepsRaw()
  return steps.filter((s) => s.status === STEP_STATUS.COMPLETED)
}

export async function getAllSteps(): Promise<{
  activeSteps: IStep[]
  archivedSteps: IStep[]
  active: IStep | null
  archived: IStep[]
}> {
  const steps = await getAllStepsRaw()
  const activeSteps = steps.filter(isActiveStep)
  const archivedSteps = steps.filter((s) => s.status === STEP_STATUS.COMPLETED)
  return {
    activeSteps,
    archivedSteps,
    active: activeSteps[0] ?? null,
    archived: archivedSteps,
  }
}

export async function createStep(data: {
  title?: string
  phase: number
  step: number
  prompt: string
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
    prompt: data.prompt,
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
  schedulePersist(steps)
  await flushPendingPersists()
  return step
}

export async function deleteStep(id: string): Promise<void> {
  const steps = await getAllStepsRaw()
  const filtered = steps.filter((s) => s.id !== id)
  schedulePersist(filtered)
  await flushPendingPersists()
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
  schedulePersist(steps)
  if (data.status === STEP_STATUS.COMPLETED) {
    await flushPendingPersists()
  }
  return steps[index]
}

export type ImportMode = 'merge' | 'overwrite'

export interface IImportResult {
  success: boolean
  importedCount: number
  mode: ImportMode
  errorMessage?: string
}

const IMPORT_VALID_STATUSES: ReadonlySet<string> = new Set([
  ...Object.values(STEP_STATUS),
  LEGACY_GPT_STATUS,
  ARCHIVED_STATUS,
])

function isIterationCycle(value: unknown): value is IIterationCycle {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Record<string, unknown>
  return (
    typeof c.cycleId === 'string' &&
    typeof c.timestamp === 'number' &&
    typeof c.prompt === 'string' &&
    typeof c.agentLog === 'string' &&
    (c.notes === undefined || typeof c.notes === 'string')
  )
}

function isImportedStep(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const s = value as Record<string, unknown>
  if (typeof s.id !== 'string' || s.id.length === 0) return false
  if (typeof s.phase !== 'number') return false
  if (typeof s.step !== 'number') return false
  if (typeof s.status !== 'string' || !IMPORT_VALID_STATUSES.has(s.status)) return false
  if (typeof s.createdAt !== 'string') return false
  if (typeof s.updatedAt !== 'string') return false
  if (s.prompt !== undefined && s.prompt !== null && typeof s.prompt !== 'string') return false
  if (s.agentLog !== undefined && s.agentLog !== null && typeof s.agentLog !== 'string') return false
  if (s.title !== undefined && typeof s.title !== 'string') return false
  if (s.hasPhaseStep !== undefined && typeof s.hasPhaseStep !== 'boolean') return false
  if (s.sourceAI !== undefined && typeof s.sourceAI !== 'string') return false
  if (s.targetAgent !== undefined && typeof s.targetAgent !== 'string') return false
  if (s.agentModel !== undefined && typeof s.agentModel !== 'string') return false
  if (s.workflowType !== undefined && s.workflowType !== 'STRICT' && s.workflowType !== 'FAST_PASS' && s.workflowType !== 'ITERATIVE') return false
  if (s.tags !== undefined && (!Array.isArray(s.tags) || s.tags.some((tag) => typeof tag !== 'string'))) return false
  if (s.iterationHistory !== undefined && (!Array.isArray(s.iterationHistory) || s.iterationHistory.some((cycle) => !isIterationCycle(cycle)))) return false
  return true
}

function normalizeImportedPayload(jsonText: string): IStep[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Geçersiz JSON formatı')
  }

  let rawSteps: unknown
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    !Array.isArray(parsed) &&
    Array.isArray((parsed as Record<string, unknown>).payload)
  ) {
    rawSteps = (parsed as Record<string, unknown>).payload
  } else if (Array.isArray(parsed)) {
    rawSteps = parsed
  } else if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    rawSteps = [parsed]
  } else {
    throw new Error('Tanınmayan veri yapısı')
  }

  const steps = rawSteps as unknown[]
  for (const item of steps) {
    if (!isImportedStep(item)) {
      throw new Error('Geçersiz adım kaydı (şema doğrulaması başarısız)')
    }
  }
  return steps.map((s) => migrateStep(s as Record<string, unknown>))
}

export async function importDataFromJson(
  jsonText: string,
  mode: ImportMode = 'merge',
): Promise<IImportResult> {
  let imported: IStep[]
  try {
    imported = normalizeImportedPayload(jsonText)
  } catch (err) {
    return {
      success: false,
      importedCount: 0,
      mode,
      errorMessage: err instanceof Error ? err.message : 'İçe aktarma hatası',
    }
  }

  let combined: IStep[]
  if (mode === 'overwrite') {
    combined = imported
  } else {
    const existing = await getAllStepsRaw()
    const byId = new Map<string, IStep>()
    for (const s of existing) byId.set(s.id, s)
    for (const s of imported) byId.set(s.id, s)
    combined = Array.from(byId.values())
  }

  schedulePersist(combined)
  await flushPendingPersists()
  return { success: true, importedCount: imported.length, mode }
}
