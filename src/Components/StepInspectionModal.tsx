import { useState, useCallback, useEffect, useRef } from 'react'
import type { IStep } from '../Interfaces/IStep'
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
    case 'GPT_FEEDBACK_REQUIRED':
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${step.hasPhaseStep === true ? `P${step.phase}.S${step.step} — ` : ''}${resolveStepTitle(step) || t.common.untitled}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor(step.status)}`}>
            {step.status}
          </span>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${workflowColor(step.workflowType)}`}>
            {step.workflowType ?? 'STRICT'}
          </span>
        </div>

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
            <CopyButton value={step.gptPrompt} />
          </div>
          <pre className="max-h-40 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-all break-words rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {step.gptPrompt ?? '—'}
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
