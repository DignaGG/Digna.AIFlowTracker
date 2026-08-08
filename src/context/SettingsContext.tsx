import { createContext, useState, useCallback, useContext, useEffect, type ReactNode } from 'react'
import type { IAppConfig } from '../Interfaces/IAppConfig'
import { getConfig, updateConfig } from '../Services/configService'

interface SettingsContextValue {
  isPhaseStepActive: boolean
  theme: 'light' | 'dark'
  updateSettings: (partial: Partial<IAppConfig>) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<IAppConfig>(() => getConfig())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  const updateSettings = useCallback((partial: Partial<IAppConfig>) => {
    const merged = updateConfig(partial)
    setSettings(merged)
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        isPhaseStepActive: settings.isPhaseStepActive === true,
        theme: settings.theme === 'dark' ? 'dark' : 'light',
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
