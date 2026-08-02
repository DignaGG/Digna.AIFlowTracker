import type { IStep } from '../Interfaces/IStep'

const MAX_TITLE_LENGTH = 40
const TRUNCATION_SUFFIX = '...'

export function resolveStepTitle(step: IStep): string {
  const explicitTitle = step.title?.trim()
  if (explicitTitle) return explicitTitle

  const promptText = (step.gptPrompt ?? '').trim()
  if (!promptText) return ''
  if (promptText.length <= MAX_TITLE_LENGTH) return promptText
  return promptText.slice(0, MAX_TITLE_LENGTH) + TRUNCATION_SUFFIX
}
