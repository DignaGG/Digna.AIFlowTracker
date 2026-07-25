import { useCallback, useEffect, useState } from 'react'
import type { IStep } from '../Interfaces/IStep'
import { STEP_STATUS } from '../Interfaces/IStep'
import {
  getActiveStep,
  getArchivedSteps,
  createStep,
  updateStep,
  deleteStep,
} from '../Services/storageService'
import { StateBanner } from '../Components/StateBanner'
import { PromptInputSection } from '../Components/PromptInputSection'
import { AgentPendingSection } from '../Components/AgentPendingSection'
import { AgentProcessingSection } from '../Components/AgentProcessingSection'
import { GptFeedbackSection } from '../Components/GptFeedbackSection'
import { ArchivedSidebar } from '../Components/ArchivedSidebar'
import { Modal } from '../Components/Modal'
import { Button } from '../Components/Button'

export function HomePage() {
  const [activeStep, setActiveStep] = useState<IStep | null>(null)
  const [archivedSteps, setArchivedSteps] = useState<IStep[]>([])
  const [deletingArchiveId, setDeletingArchiveId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const [active, archived] = await Promise.all([getActiveStep(), getArchivedSteps()])
    setActiveStep(active)
    setArchivedSteps(archived)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreateStep = useCallback(
    async (data: { phase: number; step: number; gptPrompt: string }) => {
      const step = await createStep(data)
      await updateStep(step.id, { status: STEP_STATUS.AGENT_PENDING })
      await refresh()
    },
    [refresh],
  )

  const handleMarkAsSent = useCallback(async () => {
    if (!activeStep) return
    await updateStep(activeStep.id, { status: STEP_STATUS.AGENT_PROCESSING })
    await refresh()
  }, [activeStep, refresh])

  const handleSubmitLog = useCallback(
    async (log: string) => {
      if (!activeStep) return
      await updateStep(activeStep.id, {
        agentLog: log,
        status: STEP_STATUS.GPT_FEEDBACK_REQUIRED,
      })
      await refresh()
    },
    [activeStep, refresh],
  )

  const handleCompleteCycle = useCallback(async () => {
    if (!activeStep) return
    await updateStep(activeStep.id, { status: STEP_STATUS.COMPLETED })
    await refresh()
  }, [activeStep, refresh])

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

  const renderContent = () => {
    if (!activeStep) {
      return <PromptInputSection onSubmit={handleCreateStep} />
    }

    switch (activeStep.status) {
      case STEP_STATUS.PROMPT_AWAITING:
        return <PromptInputSection onSubmit={handleCreateStep} />
      case STEP_STATUS.AGENT_PENDING:
        return (
          <AgentPendingSection
            gptPrompt={activeStep.gptPrompt ?? ''}
            onMarkAsSent={handleMarkAsSent}
          />
        )
      case STEP_STATUS.AGENT_PROCESSING:
        return (
          <AgentProcessingSection
            gptPrompt={activeStep.gptPrompt ?? ''}
            onSubmitLog={handleSubmitLog}
          />
        )
      case STEP_STATUS.GPT_FEEDBACK_REQUIRED:
        return (
          <GptFeedbackSection
            agentLog={activeStep.agentLog ?? ''}
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
        onDeleteRequest={handleDeleteArchiveRequest}
      />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
        {activeStep && (
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-slate-700 dark:text-slate-300">
              P{activeStep.phase}.S{activeStep.step}
            </span>
          </div>
        )}
        {activeStep && <StateBanner status={activeStep.status} />}
        {renderContent()}
      </main>

      <Modal
        isOpen={deletingArchiveId !== null}
        onClose={cancelArchiveDelete}
        title="Kaydı Sil"
      >
        <p className="mb-6 text-sm text-gray-600 dark:text-slate-400">
          Bu kaydı silmek istediğinize emin misiniz?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cancelArchiveDelete}>
            İptal
          </Button>
          <Button variant="danger" onClick={confirmArchiveDelete}>
            Sil
          </Button>
        </div>
      </Modal>
    </div>
  )
}
