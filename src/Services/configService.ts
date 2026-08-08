import type { IAppConfig } from '../Interfaces/IAppConfig'

const CONFIG_KEY = 'app-config'

const DEFAULT_CONFIG: IAppConfig = {
  hasCompletedOnboarding: false,
  preferredLanguage: 'tr',
  defaultWorkflow: 'STRICT',
  isPhaseStepActive: false,
  theme: 'light',
}

function migrateLegacyTheme(config: IAppConfig): IAppConfig {
  if (config.theme) return config
  const legacy = localStorage.getItem('theme')
  const legacyTheme: IAppConfig['theme'] = legacy === 'd' ? 'dark' : legacy === 'l' ? 'light' : undefined
  const migrated: IAppConfig = { ...config, theme: legacyTheme ?? DEFAULT_CONFIG.theme }
  if (legacyTheme) localStorage.setItem(CONFIG_KEY, JSON.stringify(migrated))
  return migrated
}

export function getConfig(): IAppConfig {
  const raw = localStorage.getItem(CONFIG_KEY)
  if (!raw) return migrateLegacyTheme({ ...DEFAULT_CONFIG })
  try {
    const parsed = JSON.parse(raw) as IAppConfig
    const config: IAppConfig = {
      hasCompletedOnboarding: parsed.hasCompletedOnboarding ?? DEFAULT_CONFIG.hasCompletedOnboarding,
      preferredLanguage: parsed.preferredLanguage ?? DEFAULT_CONFIG.preferredLanguage,
      defaultWorkflow: parsed.defaultWorkflow ?? DEFAULT_CONFIG.defaultWorkflow,
      isPhaseStepActive: parsed.isPhaseStepActive ?? DEFAULT_CONFIG.isPhaseStepActive,
      theme: parsed.theme,
    }
    return migrateLegacyTheme(config)
  } catch {
    return migrateLegacyTheme({ ...DEFAULT_CONFIG })
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
