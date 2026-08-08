import { useState, useCallback } from 'react'
import { HomePage } from './Pages/HomePage'
import { LockScreen } from './Components/LockScreen'
import { PasswordSettingsModal, type PasswordSettingsView } from './Components/PasswordSettingsModal'
import { SettingsModal } from './Components/SettingsModal'
import { isPasswordSetupComplete, lock } from './Services/cryptoService'
import { LanguageProvider } from './context/LanguageContext'
import { SettingsProvider } from './context/SettingsContext'
import { useTranslation } from './hooks/useTranslation'

type LockState = 'unlocked' | 'locked' | 'creating-password'

function AppInner() {
  const { t } = useTranslation()
  const [lockState, setLockState] = useState<LockState>(() =>
    isPasswordSetupComplete() ? 'locked' : 'unlocked',
  )
  const [showPasswordSettings, setShowPasswordSettings] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [cameFromSettings, setCameFromSettings] = useState(false)
  const [passwordView, setPasswordView] = useState<PasswordSettingsView>('MENU')
  const [inspectingStepId, setInspectingStepId] = useState<string | null>(null)
  const [homeResetSignal, setHomeResetSignal] = useState(0)
  const [dataRefreshSignal, setDataRefreshSignal] = useState(0)

  const handleDataImported = useCallback(() => {
    setDataRefreshSignal((prev) => prev + 1)
  }, [])

  const onGoHome = useCallback(() => {
    setInspectingStepId(null)
    setHomeResetSignal((prev) => prev + 1)
  }, [])

  const handleStepInspect = useCallback((id: string) => {
    setInspectingStepId(id)
  }, [])

  const handleCloseInspect = useCallback(() => {
    setInspectingStepId(null)
  }, [])

  const handleQuickLock = useCallback(() => {
    setInspectingStepId(null)
    setSettingsOpen(false)
    setShowPasswordSettings(false)
    setCameFromSettings(false)
    lock()
    setLockState('locked')
  }, [])

  const handleUnlock = useCallback(() => {
    setLockState('unlocked')
  }, [])

  const openPasswordSettings = useCallback((view: PasswordSettingsView) => {
    setCameFromSettings(true)
    setSettingsOpen(false)
    setPasswordView(view)
    setShowPasswordSettings(true)
  }, [])

  const closePasswordSettings = useCallback(() => {
    setShowPasswordSettings(false)
    if (cameFromSettings) {
      setCameFromSettings(false)
      setSettingsOpen(true)
    }
  }, [cameFromSettings])

  const handlePasswordLock = useCallback(() => {
    setCameFromSettings(false)
    setShowPasswordSettings(false)
    setLockState('locked')
  }, [])

  const handleRequestAddPassword = useCallback(() => {
    setSettingsOpen(false)
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
          {isPasswordSetupComplete() && (
            <button
              type="button"
              onClick={handleQuickLock}
              className="cursor-pointer rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label={t.app.lock}
              title={t.app.lock}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="cursor-pointer rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={t.app.settings}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 15a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </button>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <HomePage
          inspectingStepId={inspectingStepId}
          onInspectStep={handleStepInspect}
          onCloseInspect={handleCloseInspect}
          homeResetSignal={homeResetSignal}
          dataRefreshSignal={dataRefreshSignal}
        />
      </div>
      <PasswordSettingsModal
        isOpen={showPasswordSettings}
        onClose={closePasswordSettings}
        onLock={handlePasswordLock}
        onPasswordRemoved={closePasswordSettings}
        initialView={passwordView}
        cameFromSettings={cameFromSettings}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={cameFromSettings ? 'security' : 'general'}
        onRequestAddPassword={handleRequestAddPassword}
        onRequestChangePassword={() => openPasswordSettings('CHANGE_MASTER')}
        onRequestRemovePassword={() => openPasswordSettings('REMOVE')}
        onDataImported={handleDataImported}
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
