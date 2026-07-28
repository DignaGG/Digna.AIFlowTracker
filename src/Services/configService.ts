import type { IAppConfig } from '../Interfaces/IAppConfig'

const CONFIG_KEY = 'app-config'

const DEFAULT_CONFIG: IAppConfig = {
  hasCompletedOnboarding: false,
  preferredLanguage: 'tr',
  defaultWorkflow: 'STRICT',
}

export function getConfig(): IAppConfig {
  const raw = localStorage.getItem(CONFIG_KEY)
  if (!raw) return { ...DEFAULT_CONFIG }
  try {
    const parsed = JSON.parse(raw) as IAppConfig
    return {
      hasCompletedOnboarding: parsed.hasCompletedOnboarding ?? DEFAULT_CONFIG.hasCompletedOnboarding,
      preferredLanguage: parsed.preferredLanguage ?? DEFAULT_CONFIG.preferredLanguage,
      defaultWorkflow: parsed.defaultWorkflow ?? DEFAULT_CONFIG.defaultWorkflow,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function updateConfig(partial: Partial<IAppConfig>): IAppConfig {
  const current = getConfig()
  const merged: IAppConfig = { ...current, ...partial }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(merged))
  return merged
}

export function getLanguage(): 'tr' | 'en' {
  return getConfig().preferredLanguage
}

export function setLanguage(lang: 'tr' | 'en'): void {
  updateConfig({ preferredLanguage: lang })
}
