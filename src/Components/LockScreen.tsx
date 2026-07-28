import { useState } from 'react'
import {
  setupPasswords,
  loginWithAppPassword,
  skipEncryption,
} from '../Services/cryptoService'
import { useTranslation } from '../hooks/useTranslation'
import { inputCls } from '../styles/formClasses'

interface LockScreenProps {
  onUnlock: () => void
  mode?: 'auto' | 'create'
}

export function LockScreen({ onUnlock, mode = 'auto' }: LockScreenProps) {
  const { t } = useTranslation()
  const isCreate =
    mode === 'create' || localStorage.getItem('pipeline-salt') === null
  const [masterPassword, setMasterPassword] = useState('')
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [confirmAppPassword, setConfirmAppPassword] = useState('')
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isCreate) {
      if (!masterPassword.trim() || !confirmMasterPassword.trim() || !appPassword.trim() || !confirmAppPassword.trim()) return
      if (masterPassword !== confirmMasterPassword) {
        setError(t.lockScreen.errorMasterMismatch)
        return
      }
      if (appPassword !== confirmAppPassword) {
        setError(t.lockScreen.errorAppMismatch)
        return
      }
      if (!disclaimerAccepted) {
        setError(t.lockScreen.errorDisclaimerRequired)
        return
      }
      setLoading(true)
      try {
        await setupPasswords(masterPassword, appPassword)
        onUnlock()
      } catch {
        setError(t.lockScreen.errorGeneric)
      } finally {
        setLoading(false)
      }
    } else {
      if (!appPassword.trim()) return
      setLoading(true)
      try {
        const ok = await loginWithAppPassword(appPassword)
        if (!ok) {
          setError(t.lockScreen.errorDecrypt)
          return
        }
        onUnlock()
      } catch {
        setError(t.lockScreen.errorGeneric)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSkip = () => {
    skipEncryption()
    onUnlock()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-slate-800 dark:to-slate-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {t.lockScreen.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {isCreate
              ? t.lockScreen.createDescription
              : t.lockScreen.loginDescription}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {isCreate && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t.lockScreen.masterPasswordLabel}
                </label>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className={inputCls}
                  placeholder={t.lockScreen.masterPasswordPlaceholder}
                  autoFocus
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t.lockScreen.confirmMasterPassword}
                </label>
                <input
                  type="password"
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  className={inputCls}
                  placeholder={t.lockScreen.confirmMasterPlaceholder}
                  required
                />
              </div>
              <div className="my-1 border-t border-gray-200 dark:border-slate-600" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t.lockScreen.appPasswordLabel}
                </label>
                <input
                  type="password"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  className={inputCls}
                  placeholder={t.lockScreen.appPasswordPlaceholder}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t.lockScreen.confirmAppPassword}
                </label>
                <input
                  type="password"
                  value={confirmAppPassword}
                  onChange={(e) => setConfirmAppPassword(e.target.value)}
                  className={inputCls}
                  placeholder={t.lockScreen.confirmAppPlaceholder}
                  required
                />
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <span>{t.lockScreen.disclaimerCheckbox}</span>
              </label>
            </>
          )}

          {!isCreate && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {t.lockScreen.appPasswordLabel}
              </label>
              <input
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                className={inputCls}
                placeholder={t.lockScreen.appPasswordPlaceholder}
                autoFocus
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isCreate && !disclaimerAccepted)}
            className="mt-2 cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? t.lockScreen.loading
              : isCreate
                ? t.lockScreen.submitCreateDual
                : t.lockScreen.submitLogin}
          </button>

          {isCreate && (
            <button
              type="button"
              onClick={handleSkip}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              {t.lockScreen.skip}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
