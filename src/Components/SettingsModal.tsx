import { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useTranslation } from '../hooks/useTranslation'
import { useSettings } from '../context/SettingsContext'
import { isPasswordSetupComplete } from '../Services/cryptoService'
import {
  exportAllDataAsJson,
  importDataFromJson,
  type ImportMode,
} from '../Services/storageService'
import { downloadJsonFile } from '../utils/download'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: SettingsTab
  onRequestAddPassword: () => void
  onRequestChangePassword: () => void
  onRequestRemovePassword: () => void
  onDataImported: () => void
}

type SettingsTab = 'general' | 'security' | 'data'

type DataStatus =
  | { kind: 'idle' }
  | { kind: 'exporting' }
  | { kind: 'exported' }
  | { kind: 'importing' }
  | { kind: 'success'; count: number }
  | { kind: 'error'; message: string }

function todayStamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function segmentedClass(isActive: boolean): string {
  return isActive
    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
    : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
}

export function SettingsModal({
  isOpen,
  onClose,
  initialTab,
  onRequestAddPassword,
  onRequestChangePassword,
  onRequestRemovePassword,
  onDataImported,
}: SettingsModalProps) {
  const { t, language, setLanguage } = useTranslation()
  const { theme, updateSettings } = useSettings()
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab ?? 'general')
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [dataStatus, setDataStatus] = useState<DataStatus>({ kind: 'idle' })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setActiveTab(initialTab ?? 'general')
      setDataStatus({ kind: 'idle' })
    }
  }, [isOpen, initialTab])

  const tabs: { id: SettingsTab; label: string; enabled: boolean }[] = [
    { id: 'general', label: t.settings.tabs.general, enabled: true },
    { id: 'security', label: t.settings.tabs.security, enabled: true },
    { id: 'data', label: t.settings.tabs.data, enabled: true },
  ]

  const handleExport = async () => {
    setDataStatus({ kind: 'exporting' })
    try {
      const envelope = await exportAllDataAsJson()
      downloadJsonFile(envelope, `digna_flow_backup_${todayStamp()}.json`)
      setDataStatus({ kind: 'exported' })
    } catch {
      setDataStatus({ kind: 'error', message: t.settings.data.errorGeneric })
    }
  }

  const handleImportFile = (file: File) => {
    setDataStatus({ kind: 'importing' })
    const reader = new FileReader()
    reader.onload = async () => {
      const text = String(reader.result ?? '')
      const result = await importDataFromJson(text, importMode)
      if (result.success) {
        setDataStatus({ kind: 'success', count: result.importedCount })
        onDataImported()
      } else {
        setDataStatus({
          kind: 'error',
          message: result.errorMessage ?? t.settings.data.errorGeneric,
        })
      }
    }
    reader.onerror = () => {
      setDataStatus({ kind: 'error', message: t.settings.data.errorGeneric })
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) handleImportFile(file)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.app.settings}>
      <div className="flex flex-col gap-5">
        <div className="flex gap-1 border-b border-gray-200 pb-2 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              disabled={!tab.enabled}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-0.5 cursor-pointer border-b-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                !tab.enabled
                  ? 'cursor-not-allowed border-transparent text-gray-400 dark:text-slate-600'
                  : activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="flex flex-col gap-5">
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                {t.settings.general.languageLabel}
              </span>
              <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-slate-600 dark:bg-slate-700">
                <button
                  type="button"
                  onClick={() => setLanguage('tr')}
                  className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${segmentedClass(language === 'tr')}`}
                >
                  Türkçe
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${segmentedClass(language === 'en')}`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                {t.settings.general.themeLabel}
              </span>
              <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-slate-600 dark:bg-slate-700">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${segmentedClass(theme === 'light')}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {t.settings.general.light}
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${segmentedClass(theme === 'dark')}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  {t.settings.general.dark}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex flex-col gap-5">
            {isPasswordSetupComplete() ? (
              <>
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/20">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{t.settings.security.statusActive}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{t.settings.security.descriptionActive}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" onClick={onRequestChangePassword}>
                    {t.settings.security.changePassword}
                  </Button>
                  <Button variant="danger" onClick={onRequestRemovePassword}>
                    {t.settings.security.removePassword}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-600">
                    <svg className="h-5 w-5 text-gray-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11V7.5a3 3 0 10-6 0V11M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{t.settings.security.statusInactive}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{t.settings.security.descriptionInactive}</p>
                  </div>
                </div>
                <Button onClick={onRequestAddPassword}>{t.settings.security.addPassword}</Button>
              </>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{t.settings.data.exportLabel}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{t.settings.data.exportDescription}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                disabled={dataStatus.kind === 'exporting'}
                onClick={handleExport}
              >
                {dataStatus.kind === 'exporting' ? t.settings.data.exporting : t.settings.data.exportButton}
              </Button>
              {dataStatus.kind === 'exported' && (
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {t.settings.data.exportLabel} ✓
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0L9 9m4 4V4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{t.settings.data.importLabel}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{t.settings.data.importDescription}</p>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t.settings.data.importLabel} — {t.settings.data.modeMerge} / {t.settings.data.modeOverwrite}
                </span>
                <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-slate-600 dark:bg-slate-700">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${segmentedClass(importMode === 'merge')}`}
                  >
                    {t.settings.data.modeMerge}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('overwrite')}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      importMode === 'overwrite'
                        ? 'bg-white text-red-600 shadow-sm dark:bg-slate-800 dark:text-red-400'
                        : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    {t.settings.data.modeOverwrite}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
                  {importMode === 'merge'
                    ? t.settings.data.modeMergeHint
                    : t.settings.data.modeOverwriteHint}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant={importMode === 'overwrite' ? 'danger' : 'primary'}
                disabled={dataStatus.kind === 'importing' || dataStatus.kind === 'exporting'}
                onClick={() => fileInputRef.current?.click()}
              >
                {dataStatus.kind === 'importing'
                  ? t.settings.data.importing
                  : t.settings.data.importButton}
              </Button>

              {dataStatus.kind === 'success' && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-900/20">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300">
                    {t.settings.data.success} — {dataStatus.count} {t.settings.data.successCount}
                  </p>
                </div>
              )}
              {dataStatus.kind === 'error' && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">
                    {t.settings.data.errorGeneric}: {dataStatus.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
