import { useState, useMemo, useEffect } from 'react'
import type { IStep } from '../Interfaces/IStep'
import { resolveStepTitle } from '../utils/stepTitle'
import { inputCls } from '../styles/formClasses'
import { useTranslation } from '../hooks/useTranslation'

interface ArchivedSidebarProps {
  steps: IStep[]
  onStepClick: (id: string) => void
  onDeleteRequest: (id: string) => void
}

const loopCount = (s: IStep): number => (s.iterationHistory?.length ?? 0) + 1

const effectiveStep = (s: IStep): number =>
  s.workflowType === 'ITERATIVE' ? (s.iterationHistory?.length ?? 0) || 1 : s.step

export function ArchivedSidebar({ steps, onStepClick, onDeleteRequest }: ArchivedSidebarProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState<string>('all')
  const [stepFilter, setStepFilter] = useState<string>('all')

  const phases = useMemo(
    () => Array.from(new Set(steps.map((s) => s.phase))).sort((a, b) => a - b),
    [steps],
  )

  const phaseSteps = useMemo(
    () => (phaseFilter === 'all' ? steps : steps.filter((s) => s.phase === Number(phaseFilter))),
    [steps, phaseFilter],
  )

  const stepOptions = useMemo(
    () => Array.from(new Set(phaseSteps.map((s) => effectiveStep(s)))).sort((a, b) => a - b),
    [phaseSteps],
  )

  useEffect(() => {
    if (stepFilter !== 'all' && !stepOptions.includes(Number(stepFilter))) {
      setStepFilter('all')
    }
  }, [stepOptions, stepFilter])

  const filteredSteps = useMemo(() => {
    const q = query.trim().toLowerCase()
    return steps.filter((s) => {
      if (phaseFilter !== 'all' && s.phase !== Number(phaseFilter)) return false
      if (stepFilter !== 'all' && effectiveStep(s) !== Number(stepFilter)) return false
      if (q) {
        const haystack = [s.title, s.prompt, (s.tags ?? []).join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [steps, query, phaseFilter, stepFilter])

  const hasActiveFilters = query.trim() !== '' || phaseFilter !== 'all' || stepFilter !== 'all'

  const renderBadges = (s: IStep) =>
    s.hasPhaseStep === true &&
    (s.workflowType === 'ITERATIVE' ? (
      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
        <span className="rounded bg-cyan-100 px-1.5 py-0.5 font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
          {t.promptForm.phase} {s.phase}
        </span>
        <span className="rounded bg-cyan-100 px-1.5 py-0.5 font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
          {t.timeline.loop} #{loopCount(s)}
        </span>
      </div>
    ) : (
      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
        <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
          P{s.phase}.S{s.step}
        </span>
      </div>
    ))

  const collapsedLabel = (s: IStep): string => {
    if (s.hasPhaseStep === true && s.workflowType !== 'ITERATIVE') return String(s.step)
    return (resolveStepTitle(s) || t.common.untitled).charAt(0).toUpperCase()
  }

  const collapsedTitle = (s: IStep): string => {
    if (s.hasPhaseStep !== true) return resolveStepTitle(s) || t.common.untitled
    if (s.workflowType === 'ITERATIVE') {
      return `${t.promptForm.phase} ${s.phase} — ${t.timeline.loop} #${loopCount(s)}`
    }
    return `P${s.phase}.S${s.step}`
  }

  return (
    <aside
      className={`hidden md:flex flex-none flex-col h-full min-h-0 border-r border-gray-200 bg-gray-50 transition-all duration-300 dark:border-slate-700 dark:bg-slate-900 ${collapsed ? 'w-16' : 'w-72'}`}
    >
      <div className="flex-none flex items-center justify-between border-b border-gray-200 p-4 dark:border-slate-700">
        {!collapsed && (
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 dark:text-slate-400">
            {t.sidebar.title}
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label={collapsed ? t.sidebar.expand : t.sidebar.collapse}
        >
          <svg
            className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="flex-none flex flex-col gap-2 border-b border-gray-200 p-4 dark:border-slate-700">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.filters.searchPlaceholder}
              className={`${inputCls} pr-8`}
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t.filters.clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className={inputCls}
            >
              <option value="all">{t.filters.allPhases}</option>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {t.filters.phaseLabel} {p}
                </option>
              ))}
            </select>
            <select
              value={stepFilter}
              onChange={(e) => setStepFilter(e.target.value)}
              className={inputCls}
            >
              <option value="all">{t.filters.allSteps}</option>
              {stepOptions.map((s) => (
                <option key={s} value={s}>
                  {t.filters.stepLabel} {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 p-4 min-h-0">
        {filteredSteps.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500">
            {collapsed ? '—' : hasActiveFilters ? t.filters.empty : t.sidebar.empty}
          </p>
        ) : collapsed ? (
          <div className="flex flex-col items-center gap-3">
            {filteredSteps.map((s) => (
              <button
                key={s.id}
                onClick={() => onStepClick(s.id)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                title={collapsedTitle(s)}
              >
                {collapsedLabel(s)}
              </button>
            ))}
          </div>
        ) : (
          filteredSteps.map((s) => (
            <div
              key={s.id}
              onClick={() => onStepClick(s.id)}
              className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-750"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteRequest(s.id)
                }}
                className="absolute right-2 top-2 cursor-pointer rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                aria-label={t.sidebar.deleteLabel}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {renderBadges(s)}
              <p className="mb-0.5 truncate break-all text-sm font-semibold text-gray-900 dark:text-slate-100">
                {resolveStepTitle(s) || t.common.untitled}
              </p>
              <p className="line-clamp-2 text-sm text-gray-700 dark:text-slate-300">
                {s.prompt}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
