import { useState } from 'react'
import {
  setupPassword,
  validateAndSetPassword,
  skipEncryption,
} from '../Services/cryptoService'

interface LockScreenProps {
  onUnlock: () => void
  mode?: 'auto' | 'create'
}

export function LockScreen({ onUnlock, mode = 'auto' }: LockScreenProps) {
  const isCreate =
    mode === 'create' || localStorage.getItem('pipeline-salt') === null
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password) return

    if (isCreate && password !== confirm) {
      setError('Parolalar eşleşmiyor')
      return
    }

    setLoading(true)
    try {
      if (isCreate) {
        await setupPassword(password)
        onUnlock()
      } else {
        const ok = await validateAndSetPassword(password)
        if (!ok) {
          setError('Hatalı parola! Şifre çözülemedi.')
          return
        }
        onUnlock()
      }
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
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
            Digna AI Akış Takibi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {isCreate
              ? 'Master parola belirleyin'
              : 'Master parolanızı girin'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Master Parola
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="Parola"
              autoFocus
              required
            />
          </div>

          {isCreate && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Parolayı Onayla
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                placeholder="Parola tekrar"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'İşleniyor...'
              : isCreate
                ? 'Parola Belirle'
                : 'Giriş Yap'}
          </button>

          {isCreate && (
            <button
              type="button"
              onClick={handleSkip}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Parolasız Devam Et
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
