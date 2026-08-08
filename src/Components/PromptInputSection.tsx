import { memo, useCallback, useState } from 'react'
import { Button } from './Button'
import { useTranslation } from '../hooks/useTranslation'
import { useSettings } from '../context/SettingsContext'
import { inputCls, textareaCls } from '../styles/formClasses'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)

type WorkflowType = 'STRICT' | 'FAST_PASS' | 'ITERATIVE'

interface PromptInputSectionProps {
  onSubmit: (data: {
    title?: string
    phase: number
    step: number
    prompt: string
    workflowType: WorkflowType
    sourceAI?: string
    targetAgent?: string
    agentModel?: string
    hasPhaseStep?: boolean
    tags?: string[]
  }) => void
}

const WORKFLOW_OPTIONS: { value: WorkflowType; label: string }[] = [
  { value: 'STRICT', label: 'STRICT' },
  { value: 'ITERATIVE', label: 'ITERATIVE' },
]

export const PromptInputSection = memo(function PromptInputSection({
  onSubmit,
}: PromptInputSectionProps) {
  const { t } = useTranslation()
  const { isPhaseStepActive, updateSettings } = useSettings()
  const [title, setTitle] = useState('')
  const [phase, setPhase] = useState('1')
  const [step, setStep] = useState('1')
  const [prompt, setPrompt] = useState('')
  const [workflowType, setWorkflowType] = useState<WorkflowType>('STRICT')
  const [isFastPassActive, setIsFastPassActive] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleWorkflowChange = useCallback((value: WorkflowType) => {
    setWorkflowType(value)
    if (value !== 'STRICT') {
      setIsFastPassActive(false)
    }
  }, [])

  const effectiveWorkflow: WorkflowType =
    workflowType === 'STRICT' && isFastPassActive ? 'FAST_PASS' : workflowType
  const [sourceAI, setSourceAI] = useState('')
  const [targetAgent, setTargetAgent] = useState('')
  const [agentModel, setAgentModel] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const submitLabels: Record<WorkflowType, string> = {
    STRICT: t.promptForm.submitStrict,
    FAST_PASS: t.promptForm.submitFastPass,
    ITERATIVE: t.promptForm.submitIterative,
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!prompt.trim()) return
      const phaseNum = isPhaseStepActive ? Number(phase) : 1
      const stepNum = isPhaseStepActive ? Number(step) : 1
      if (isPhaseStepActive && (!phaseNum || !stepNum)) return
      const tags = tagsInput.trim()
        ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined
      onSubmit({
        ...(title.trim() && { title: title.trim() }),
        phase: phaseNum,
        step: stepNum,
        hasPhaseStep: isPhaseStepActive,
        prompt: prompt.trim(),
        workflowType: effectiveWorkflow,
        ...(sourceAI.trim() && { sourceAI: sourceAI.trim() }),
        ...(targetAgent.trim() && { targetAgent: targetAgent.trim() }),
        ...(agentModel.trim() && { agentModel: agentModel.trim() }),
        ...(tags && tags.length > 0 && { tags }),
      })
    },
    [
      onSubmit,
      isPhaseStepActive,
      prompt,
      phase,
      step,
      tagsInput,
      title,
      sourceAI,
      targetAgent,
      agentModel,
      effectiveWorkflow,
    ],
  )

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (typeof e.currentTarget.form?.requestSubmit === 'function') {
          e.currentTarget.form.requestSubmit()
        }
      }
    },
    [],
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t.promptForm.title}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
          placeholder={t.promptForm.titlePlaceholder}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t.promptForm.workflowType}</label>
        <div className="flex gap-1.5">
          {WORKFLOW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleWorkflowChange(opt.value)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                workflowType === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {workflowType === opt.value && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {opt.label}
            </button>
          ))}
        </div>
        {workflowType === 'STRICT' && (
          <button
            type="button"
            onClick={() => setIsFastPassActive(!isFastPassActive)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all self-start mt-1 ${
              isFastPassActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-slate-500 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {isFastPassActive && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t.promptForm.fastPassToggle}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <svg
          className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {t.promptForm.advancedOptions}
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => updateSettings({ isPhaseStepActive: !isPhaseStepActive })}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all self-start ${
              isPhaseStepActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-slate-500 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {isPhaseStepActive && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.promptForm.phaseStepToggle}
          </button>
          {isPhaseStepActive && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.promptForm.phase}</label>
                <input
                  type="number"
                  min={1}
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className={inputCls}
                  placeholder="1"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.promptForm.step}</label>
                <input
                  type="number"
                  min={1}
                  value={step}
                  onChange={(e) => setStep(e.target.value)}
                  className={inputCls}
                  placeholder="1"
                  required
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.promptForm.sourceAI}</label>
              <input
                type="text"
                value={sourceAI}
                onChange={(e) => setSourceAI(e.target.value)}
                className={inputCls}
                placeholder="gpt-4o"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.promptForm.targetAgent}</label>
              <input
                type="text"
                value={targetAgent}
                onChange={(e) => setTargetAgent(e.target.value)}
                className={inputCls}
                placeholder="code-executor"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.promptForm.agentModel}</label>
              <input
                type="text"
                value={agentModel}
                onChange={(e) => setAgentModel(e.target.value)}
                className={inputCls}
                placeholder="claude-3-opus"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.promptForm.tags}</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className={inputCls}
                placeholder={t.promptForm.tagsPlaceholder}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          {t.promptForm.promptLabel}
        </label>
        <textarea
          rows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          className={textareaCls}
          placeholder={t.promptForm.promptPlaceholder}
          required
        />
      </div>
      <div className="flex items-center justify-end gap-3">
        <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px]">
          <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-semibold rounded border border-slate-700 bg-slate-800 text-slate-300 shadow-sm">
            {isMac ? '⌘' : 'Ctrl'}
          </kbd>
          +
          <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-semibold rounded border border-slate-700 bg-slate-800 text-slate-300 shadow-sm">
            Enter
          </kbd>
        </span>
        <Button type="submit">{submitLabels[effectiveWorkflow]}</Button>
      </div>
    </form>
  )
})
