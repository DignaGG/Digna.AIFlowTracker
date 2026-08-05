import { useState, useCallback, useEffect, useRef } from 'react'
import type { IStep, IIterationCycle } from '../Interfaces/IStep'
import { resolveStepTitle } from '../utils/stepTitle'
import { Modal } from './Modal'
import { Button } from './Button'
import { useTranslation } from '../hooks/useTranslation'

interface StepInspectionModalProps {
  step: IStep | null
  isOpen: boolean
  onClose: () => void
  onDeleteRequest: (id: string) => void
}

function CopyButton({ value }: { value: string | null }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // silently fail
    }
  }, [value])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  if (!value) return null

  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
      aria-label={t.common.copy}
    >
      {copied ? (
        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )}
    </button>
  )
}

function statusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'AGENT_PROCESSING':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
    case 'AGENT_PENDING':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'LLM_FEEDBACK_REQUIRED':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

function workflowColor(workflow?: string): string {
  switch (workflow) {
    case 'STRICT':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
    case 'FAST_PASS':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    case 'ITERATIVE':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
    default:
      return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
  }
}

function IterationAccordion({ cycle, index }: { cycle: IIterationCycle; index: number }) {
  const { t, language } = useTranslation()
  const [open, setOpen] = useState(false)
  const localeStr = language === 'tr' ? 'tr-TR' : 'en-US'

  return (
    <li className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left transition-colors hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      >
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
          {t.timeline.loop} {index + 1}
        </span>
        <span className="text-[11px] text-gray-400 dark:text-slate-500">
          {new Date(cycle.timestamp).toLocaleString(localeStr)}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {t.timeline.promptLabel}
            </span>
            <pre className="mt-1 max-h-40 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-all break-words rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              {cycle.prompt}
            </pre>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {t.timeline.logLabel}
            </span>
            <pre className="mt-1 max-h-40 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-all break-words rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              {cycle.agentLog}
            </pre>
          </div>
        </div>
      )}
    </li>
  )
}

export function StepInspectionModal({ step, isOpen, onClose, onDeleteRequest }: StepInspectionModalProps) {
  const { t, language } = useTranslation()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const confirmRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleDelete = useCallback(() => {
    if (!step) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      confirmRef.current = setTimeout(() => setConfirmingDelete(false), 4000)
      return
    }
    onDeleteRequest(step.id)
    onClose()
  }, [step, confirmingDelete, onDeleteRequest, onClose])

  useEffect(() => {
    if (!isOpen) {
      setConfirmingDelete(false)
      if (confirmRef.current) clearTimeout(confirmRef.current)
    }
  }, [isOpen])

  if (!step) return null

  const localeStr = language === 'tr' ? 'tr-TR' : 'en-US'

  const labelPrefix =
    step.hasPhaseStep === true
      ? step.workflowType === 'ITERATIVE'
        ? `${t.promptForm.phase} ${step.phase} — ${t.timeline.loop} #${(step.iterationHistory?.length ?? 0) + 1} — `
        : `P${step.phase}.S${step.step} — `
      : ''

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${labelPrefix}${resolveStepTitle(step) || t.common.untitled}`}
    >
      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor(step.status)}`}>
            {step.status}
          </span>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${workflowColor(step.workflowType)}`}>
            {step.workflowType ?? 'STRICT'}
          </span>
        </div>

        <div className="mt-2 flex max-h-[60vh] flex-col space-y-4 overflow-y-auto border-t border-gray-200 px-6 py-4 dark:border-slate-700 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-500">
          <div className="grid grid-cols-2 gap-3 text-sm">
          {step.sourceAI && (
            <div>
              <span className="text-xs text-gray-500 dark:text-slate-400">{t.stepInspection.sourceAI}</span>
              <p className="font-medium text-gray-900 dark:text-slate-100">{step.sourceAI}</p>
            </div>
          )}
          {step.targetAgent && (
            <div>
              <span className="text-xs text-gray-500 dark:text-slate-400">{t.stepInspection.targetAgent}</span>
              <p className="font-medium text-gray-900 dark:text-slate-100">{step.targetAgent}</p>
            </div>
          )}
          {step.agentModel && (
            <div>
              <span className="text-xs text-gray-500 dark:text-slate-400">{t.stepInspection.agentModel}</span>
              <p className="font-medium text-gray-900 dark:text-slate-100">{step.agentModel}</p>
            </div>
          )}
        </div>

        {step.tags && step.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {step.tags.map((tag, i) => (
              <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.stepInspection.promptLabel}</span>
            <CopyButton value={step.prompt} />
          </div>
          <pre className="max-h-40 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-all break-words rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {step.prompt ?? '—'}
          </pre>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.stepInspection.logLabel}</span>
            <CopyButton value={step.agentLog} />
          </div>
          <pre className="max-h-40 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-all break-words rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {step.agentLog ?? '—'}
          </pre>
        </div>

        {step.iterationHistory && step.iterationHistory.length > 0 && (
          <div>
            <div className="mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                {t.timeline.title}
              </span>
            </div>
            <ol className="space-y-2 border-l border-gray-200 pl-3 dark:border-slate-700">
              {step.iterationHistory.map((cycle, i) => (
                <IterationAccordion key={cycle.cycleId} cycle={cycle} index={i} />
              ))}
            </ol>
          </div>
        )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-slate-400">
          <div>
            <span className="block">{t.stepInspection.createdAt}</span>
            <span className="font-medium text-gray-700 dark:text-slate-300">
              {new Date(step.createdAt).toLocaleString(localeStr)}
            </span>
          </div>
          <div>
            <span className="block">{t.stepInspection.updatedAt}</span>
            <span className="font-medium text-gray-700 dark:text-slate-300">
              {new Date(step.updatedAt).toLocaleString(localeStr)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose}>
            {t.stepInspection.close}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {confirmingDelete ? t.stepInspection.confirmDelete : t.stepInspection.delete}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
