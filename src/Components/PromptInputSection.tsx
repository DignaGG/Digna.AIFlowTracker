import { useState } from 'react'
import { Button } from './Button'

interface PromptInputSectionProps {
  onSubmit: (data: { phase: number; step: number; gptPrompt: string }) => void
}

export function PromptInputSection({ onSubmit }: PromptInputSectionProps) {
  const [phase, setPhase] = useState('')
  const [step, setStep] = useState('')
  const [gptPrompt, setGptPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const phaseNum = Number(phase)
    const stepNum = Number(step)
    if (!phaseNum || !stepNum || !gptPrompt.trim()) return
    onSubmit({ phase: phaseNum, step: stepNum, gptPrompt: gptPrompt.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Phase</label>
          <input
            type="number"
            min={1}
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="1"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Step</label>
          <input
            type="number"
            min={1}
            value={step}
            onChange={(e) => setStep(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="1"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Orchestrator AI'dan Gelen Prompt
        </label>
        <textarea
          rows={6}
          value={gptPrompt}
          onChange={(e) => setGptPrompt(e.target.value)}
          className="resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Prompt metnini buraya yapıştırın..."
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Kaydet ve Agent'a Hazırla</Button>
      </div>
    </form>
  )
}
