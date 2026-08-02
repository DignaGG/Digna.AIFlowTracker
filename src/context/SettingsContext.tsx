import { createContext, useState, useCallback, useContext, type ReactNode } from 'react'
import type { IAppConfig } from '../Interfaces/IAppConfig'
import { getConfig, updateConfig } from '../Services/configService'

interface SettingsContextValue {
  isPhaseStepActive: boolean
  updateSettings: (partial: Partial<IAppConfig>) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<IAppConfig>(() => getConfig())

  const updateSettings = useCallback((partial: Partial<IAppConfig>) => {
    const merged = updateConfig(partial)
    setSettings(merged)
  }, [])

  return (
    <SettingsContext.Provider value={{ isPhaseStepActive: settings.isPhaseStepActive === true, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
