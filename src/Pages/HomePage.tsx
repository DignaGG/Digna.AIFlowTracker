import { useCallback, useEffect, useRef, useState } from 'react'
import type { IStep } from '../Interfaces/IStep'
import { STEP_STATUS } from '../Interfaces/IStep'
import { resolveStepTitle } from '../utils/stepTitle'
import {
  getAllSteps,
  getActiveSteps,
  createStep,
  updateStep,
  deleteStep,
} from '../Services/storageService'
import { StateBanner } from '../Components/StateBanner'
import { PromptInputSection } from '../Components/PromptInputSection'
import { AgentPendingSection } from '../Components/AgentPendingSection'
import { AgentProcessingSection } from '../Components/AgentProcessingSection'
import { LlmFeedbackSection } from '../Components/LlmFeedbackSection'
import { ArchivedSidebar } from '../Components/ArchivedSidebar'
import { ActiveTasksDrawer } from '../Components/ActiveTasksDrawer'
import { StepInspectionModal } from '../Components/StepInspectionModal'
import { Modal } from '../Components/Modal'
import { Button } from '../Components/Button'
import { useTranslation } from '../hooks/useTranslation'

interface HomePageProps {
  inspectingStepId: string | null
  onInspectStep: (id: string) => void
  onCloseInspect: () => void
  homeResetSignal: number
  dataRefreshSignal?: number
}

export function HomePage({
  inspectingStepId,
  onInspectStep,
  onCloseInspect,
  homeResetSignal,
  dataRefreshSignal,
}: HomePageProps) {
  const { t } = useTranslation()
  const [activeSteps, setActiveSteps] = useState<IStep[]>([])
  const [archivedSteps, setArchivedSteps] = useState<IStep[]>([])
  const [focusedStepId, setFocusedStepId] = useState<string | null>(null)
  const [deletingArchiveId, setDeletingArchiveId] = useState<string | null>(null)

  const focusedStep =
    focusedStepId !== null
      ? activeSteps.find((s) => s.id === focusedStepId) ?? null
      : null

  const inspectedStep = inspectingStepId
    ? archivedSteps.find((s) => s.id === inspectingStepId) ?? null
    : null

  useEffect(() => {
    if (homeResetSignal > 0) {
      setFocusedStepId(null)
    }
  }, [homeResetSignal])

  useEffect(() => {
    if (inspectingStepId && !inspectedStep) {
      onCloseInspect()
    }
  }, [inspectingStepId, inspectedStep, onCloseInspect])

  const refresh = useCallback(async () => {
    const active = await getActiveSteps()
    const { archivedSteps: archived } = await getAllSteps()
    setActiveSteps(active)
    setArchivedSteps(archived)
    setFocusedStepId((prev) => {
      if (prev !== null && active.some((s) => s.id === prev)) return prev
      return active.length > 0 ? (active[0]?.id ?? null) : null
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isFirstDataSignal = useRef(true)
  useEffect(() => {
    if (dataRefreshSignal === undefined) return
    if (isFirstDataSignal.current) {
      isFirstDataSignal.current = false
      return
    }
    refresh()
  }, [dataRefreshSignal, refresh])

  const handleCreateStep = useCallback(
    async (data: {
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
    }) => {
      const step = await createStep(data)
      const isFastOrIterative = data.workflowType === 'FAST_PASS' || data.workflowType === 'ITERATIVE'
      await updateStep(step.id, {
        status: isFastOrIterative ? STEP_STATUS.AGENT_PROCESSING : STEP_STATUS.AGENT_PENDING,
      })
      await refresh()
      setFocusedStepId(step.id)
    },
    [refresh],
  )

  const handleMarkAsSent = useCallback(async () => {
    if (!focusedStep) return
    await updateStep(focusedStep.id, { status: STEP_STATUS.AGENT_PROCESSING })
    await refresh()
  }, [focusedStep, refresh])

  const handleSubmitLog = useCallback(
    async (log: string) => {
      if (!focusedStep) return
      const updates: Partial<IStep> = { agentLog: log }
      if (focusedStep.workflowType === 'ITERATIVE') {
        const prevHistory = focusedStep.iterationHistory ?? []
        updates.iterationHistory = [
          ...prevHistory,
          {
            cycleId: crypto.randomUUID(),
            timestamp: Date.now(),
            prompt: focusedStep.prompt ?? '',
            agentLog: log,
          },
        ]
        updates.status = STEP_STATUS.AGENT_PENDING
      } else if (focusedStep.workflowType === 'FAST_PASS') {
        updates.status = STEP_STATUS.COMPLETED
      } else {
        updates.status = STEP_STATUS.LLM_FEEDBACK_REQUIRED
      }
      await updateStep(focusedStep.id, updates)
      await refresh()
    },
    [focusedStep, refresh],
  )

  const handleCompleteCycle = useCallback(async () => {
    if (!focusedStep) return
    await updateStep(focusedStep.id, { status: STEP_STATUS.COMPLETED })
    await refresh()
  }, [focusedStep, refresh])

  const handleCompleteIteration = useCallback(async () => {
    if (!focusedStep) return
    await updateStep(focusedStep.id, { status: STEP_STATUS.COMPLETED })
    await refresh()
  }, [focusedStep, refresh])

  const handleDeleteArchiveRequest = useCallback((id: string) => {
    setDeletingArchiveId(id)
  }, [])

  const confirmArchiveDelete = useCallback(async () => {
    if (deletingArchiveId !== null) {
      await deleteStep(deletingArchiveId)
      setDeletingArchiveId(null)
      await refresh()
    }
  }, [deletingArchiveId, refresh])

  const cancelArchiveDelete = useCallback(() => {
    setDeletingArchiveId(null)
  }, [])

  const handleDeleteFromModal = useCallback((id: string) => {
    onCloseInspect()
    setDeletingArchiveId(id)
  }, [onCloseInspect])

  const renderContent = () => {
    if (!focusedStep) {
      return <PromptInputSection key={focusedStepId || 'new-session'} onSubmit={handleCreateStep} />
    }

    switch (focusedStep.status) {
      case STEP_STATUS.PROMPT_AWAITING:
        return <PromptInputSection key={focusedStepId || 'new-session'} onSubmit={handleCreateStep} />
      case STEP_STATUS.AGENT_PENDING:
        return (
          <AgentPendingSection
            prompt={focusedStep.prompt ?? ''}
            onMarkAsSent={handleMarkAsSent}
            workflowType={focusedStep.workflowType}
            onCompleteCycle={focusedStep.workflowType === 'ITERATIVE' ? handleCompleteIteration : undefined}
          />
        )
      case STEP_STATUS.AGENT_PROCESSING:
        return (
          <AgentProcessingSection
            prompt={focusedStep.prompt ?? ''}
            onSubmitLog={handleSubmitLog}
          />
        )
      case STEP_STATUS.LLM_FEEDBACK_REQUIRED:
        return (
          <LlmFeedbackSection
            agentLog={focusedStep.agentLog ?? ''}
            onCompleteCycle={handleCompleteCycle}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <ArchivedSidebar
        steps={archivedSteps}
        onStepClick={onInspectStep}
        onDeleteRequest={handleDeleteArchiveRequest}
      />

      <StepInspectionModal
        step={inspectedStep}
        isOpen={inspectingStepId !== null}
        onClose={onCloseInspect}
        onDeleteRequest={handleDeleteFromModal}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
          {focusedStep?.hasPhaseStep === true && (
            <div className="flex items-center gap-2">
              {focusedStep.workflowType === 'ITERATIVE' ? (
                <>
                  <span className="rounded-md bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                    {t.promptForm.phase} {focusedStep.phase}
                  </span>
                  <span className="rounded-md bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                    {t.timeline.loop} #{(focusedStep.iterationHistory?.length ?? 0) + 1}
                  </span>
                </>
              ) : (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                  P{focusedStep.phase}.S{focusedStep.step}
                </span>
              )}
            </div>
          )}
          {focusedStep && (
            <StateBanner status={focusedStep.status} workflowType={focusedStep.workflowType} />
          )}
          {renderContent()}
        </main>

        <ActiveTasksDrawer
          activeSteps={activeSteps}
          focusedStepId={focusedStepId}
          onSelect={setFocusedStepId}
          onNewSession={() => setFocusedStepId(null)}
        />
      </div>

      <Modal
        isOpen={deletingArchiveId !== null}
        onClose={cancelArchiveDelete}
        title={t.deleteModal.title}
      >
        <p className="mb-6 text-sm text-gray-600 dark:text-slate-400">
          {t.deleteModal.message}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cancelArchiveDelete}>
            {t.deleteModal.cancel}
          </Button>
          <Button variant="danger" onClick={confirmArchiveDelete}>
            {t.deleteModal.confirm}
          </Button>
        </div>
      </Modal>

      {focusedStep && inspectingStepId !== null && (
        <div className="fixed bottom-16 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
          <span className="max-w-56 truncate text-sm font-medium text-gray-700 dark:text-slate-300">
            {t.common.activeProcess}: {resolveStepTitle(focusedStep) || t.common.untitled}
          </span>
          <button
            type="button"
            onClick={onCloseInspect}
            className="cursor-pointer rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-700"
          >
            {t.common.view}
          </button>
        </div>
      )}
    </div>
  )
}
