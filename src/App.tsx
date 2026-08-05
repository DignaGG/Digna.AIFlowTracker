import { useState, useCallback, useEffect } from 'react'
import { HomePage } from './Pages/HomePage'
import { LockScreen } from './Components/LockScreen'
import { Button } from './Components/Button'
import { PasswordSettingsModal } from './Components/PasswordSettingsModal'
import {
  isPasswordSetupComplete,
  isUnlocked,
} from './Services/cryptoService'
import { LanguageProvider } from './context/LanguageContext'
import { SettingsProvider } from './context/SettingsContext'
import { useTranslation } from './hooks/useTranslation'

type LockState = 'unlocked' | 'locked' | 'creating-password'

function AppInner() {
  const { t, language, setLanguage } = useTranslation()
  const [lockState, setLockState] = useState<LockState>(() =>
    isPasswordSetupComplete() ? 'locked' : 'unlocked',
  )
  const [showPasswordSettings, setShowPasswordSettings] = useState(false)
  const [inspectingStepId, setInspectingStepId] = useState<string | null>(null)
  const [homeResetSignal, setHomeResetSignal] = useState(0)

  const onGoHome = useCallback(() => {
    setInspectingStepId(null)
    setHomeResetSignal((prev) => prev + 1)
  }, [])

  const handleStepInspect = useCallback((id: string) => {
    setInspectingStepId(id)
  }, [])

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') === 'd' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme === 'dark' ? 'd' : 'l')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const handleUnlock = useCallback(() => {
    setLockState('unlocked')
  }, [])

  const handleAddPassword = useCallback(() => {
    setLockState('creating-password')
  }, [])

  if (lockState === 'locked') {
    return <LockScreen onUnlock={handleUnlock} />
  }

  if (lockState === 'creating-password') {
    return <LockScreen onUnlock={handleUnlock} mode="create" />
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white dark:bg-slate-900">
      <header className="relative z-[60] flex-none h-14 flex items-center justify-between border-b border-gray-200 px-6 dark:border-slate-700">
        <button
          type="button"
          onClick={onGoHome}
          className="cursor-pointer text-sm font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
        >
          {t.app.title}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={language === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
          >
            {language === 'tr' ? 'EN' : 'TR'}
          </button>
          <button
            onClick={toggleTheme}
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={t.app.toggleTheme}
          >
            {theme === 'light' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          {isPasswordSetupComplete() && isUnlocked() ? (
            <Button variant="secondary" onClick={() => setShowPasswordSettings(true)}>
              {t.app.passwordSettings}
            </Button>
          ) : !isPasswordSetupComplete() ? (
            <Button variant="secondary" onClick={handleAddPassword}>
              {t.app.addPassword}
            </Button>
          ) : null}
        </div>
      </header>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <HomePage
          inspectingStepId={inspectingStepId}
          onInspectStep={handleStepInspect}
          onCloseInspect={onGoHome}
          homeResetSignal={homeResetSignal}
        />
      </div>
      <PasswordSettingsModal
        isOpen={showPasswordSettings}
        onClose={() => setShowPasswordSettings(false)}
        onLock={() => setLockState('locked')}
        onPasswordRemoved={() => setShowPasswordSettings(false)}
      />
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <AppInner />
      </SettingsProvider>
    </LanguageProvider>
  )
}

export default App
