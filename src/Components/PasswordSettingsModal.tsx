import { useState, useRef, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useTranslation } from '../hooks/useTranslation'
import { changeMasterPassword, changeAppPassword, removePasswordProtection, lock, DecryptionError } from '../Services/cryptoService'
import { inputCls } from '../styles/formClasses'

export type PasswordSettingsView = 'MENU' | 'CHANGE_MASTER' | 'CHANGE_APP' | 'REMOVE'

interface PasswordSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onLock: () => void
  onPasswordRemoved: () => void
  initialView?: PasswordSettingsView
  cameFromSettings?: boolean
}

export function PasswordSettingsModal({ isOpen, onClose, onLock, onPasswordRemoved, initialView, cameFromSettings }: PasswordSettingsModalProps) {
  const { t } = useTranslation()
  const [activeView, setActiveView] = useState<PasswordSettingsView>('MENU')
  const [currentMaster, setCurrentMaster] = useState('')
  const [newValue, setNewValue] = useState('')
  const [confirmNewValue, setConfirmNewValue] = useState('')
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimeouts = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current)
      confirmTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => clearTimeouts()
  }, [])

  useEffect(() => {
    if (isOpen) setActiveView(initialView ?? 'MENU')
  }, [isOpen, initialView])

  const resetForm = () => {
    clearTimeouts()
    setCurrentMaster('')
    setNewValue('')
    setConfirmNewValue('')
    setConfirmingRemove(false)
    setError('')
    setSuccess('')
  }

  const navigateTo = (view: PasswordSettingsView) => {
    resetForm()
    setActiveView(view)
  }

  const handleClose = () => {
    resetForm()
    setActiveView('MENU')
    onClose()
  }

  const handleBack = () => {
    if (
      cameFromSettings ||
      activeView === 'CHANGE_MASTER' ||
      activeView === 'CHANGE_APP' ||
      activeView === 'REMOVE'
    ) {
      handleClose()
    } else {
      navigateTo('MENU')
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleChangeMasterPassword = async () => {
    clearMessages()
    if (!currentMaster || !newValue || !confirmNewValue) {
      setError(t.passwordSettings.errorEmptyFields)
      return
    }
    if (newValue !== confirmNewValue) {
      setError(t.passwordSettings.errorPasswordMismatch)
      return
    }
    try {
      await changeMasterPassword(currentMaster, newValue)
      setSuccess(t.passwordSettings.masterPasswordChanged)
      successTimeoutRef.current = setTimeout(() => handleClose(), 2000)
    } catch (err) {
      if (err instanceof DecryptionError) {
        setError(t.passwordSettings.errorWrongPassword)
      } else {
        setError(t.lockScreen.errorGeneric)
      }
    }
  }

  const handleChangeAppPassword = async () => {
    clearMessages()
    if (!currentMaster || !newValue || !confirmNewValue) {
      setError(t.passwordSettings.errorEmptyFields)
      return
    }
    if (newValue !== confirmNewValue) {
      setError(t.passwordSettings.errorPasswordMismatch)
      return
    }
    try {
      await changeAppPassword(currentMaster, newValue)
      setSuccess(t.passwordSettings.appPasswordChanged)
      successTimeoutRef.current = setTimeout(() => handleClose(), 2000)
    } catch (err) {
      if (err instanceof DecryptionError) {
        setError(t.passwordSettings.errorWrongPassword)
      } else {
        setError(t.lockScreen.errorGeneric)
      }
    }
  }

  const handleRemovePassword = async () => {
    clearMessages()
    if (!currentMaster) {
      setError(t.passwordSettings.errorEmptyFields)
      return
    }
    if (!confirmingRemove) {
      setConfirmingRemove(true)
      confirmTimeoutRef.current = setTimeout(() => setConfirmingRemove(false), 4000)
      return
    }
    try {
      await removePasswordProtection(currentMaster)
      clearTimeouts()
      onPasswordRemoved()
      handleClose()
    } catch (err) {
      if (err instanceof DecryptionError) {
        setError(t.passwordSettings.errorWrongPassword)
      } else {
        setError(t.lockScreen.errorGeneric)
      }
      setConfirmingRemove(false)
    }
  }

  const handleLockClick = () => {
    lock()
    onLock()
    handleClose()
  }

  const renderMenu = () => (
    <>
      <button
        type="button"
        onClick={() => navigateTo('CHANGE_MASTER')}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-slate-100">{t.passwordSettings.changeMasterPassword}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => navigateTo('CHANGE_APP')}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
          <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-slate-100">{t.passwordSettings.changeAppPassword}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => navigateTo('REMOVE')}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-red-200 hover:bg-red-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-red-500 dark:hover:bg-red-900/20"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <svg className="h-5 w-5 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-slate-100">{t.passwordSettings.removePassword}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={handleLockClick}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-600"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-600">
          <svg className="h-5 w-5 text-gray-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-slate-100">{t.passwordSettings.lock}</p>
        </div>
      </button>
    </>
  )

  const renderBackButton = () => (
    <button
      type="button"
      onClick={handleBack}
      className="mb-3 flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {t.passwordSettings.back}
    </button>
  )

  const renderSegmentedTab = () => (
    <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-slate-600 dark:bg-slate-700">
      <button
        type="button"
        onClick={() => setActiveView('CHANGE_MASTER')}
        className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          activeView === 'CHANGE_MASTER'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
        }`}
      >
        {t.passwordSettings.tabs.master}
      </button>
      <button
        type="button"
        onClick={() => setActiveView('CHANGE_APP')}
        className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          activeView === 'CHANGE_APP'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
        }`}
      >
        {t.passwordSettings.tabs.app}
      </button>
    </div>
  )

  const renderChangeMasterView = () => (
    <>
      {renderBackButton()}
      {renderSegmentedTab()}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.passwordSettings.currentMasterPassword}</label>
          <input type="password" value={currentMaster} onChange={(e) => { setCurrentMaster(e.target.value); clearMessages() }} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.passwordSettings.newMasterPassword}</label>
          <input type="password" value={newValue} onChange={(e) => { setNewValue(e.target.value); clearMessages() }} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.passwordSettings.confirmNewMasterPassword}</label>
          <input type="password" value={confirmNewValue} onChange={(e) => { setConfirmNewValue(e.target.value); clearMessages() }} className={inputCls} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button onClick={handleChangeMasterPassword}>{t.passwordSettings.updateMasterPassword}</Button>
      </div>
    </>
  )

  const renderChangeAppView = () => (
    <>
      {renderBackButton()}
      {renderSegmentedTab()}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.passwordSettings.currentMasterPassword}</label>
          <input type="password" value={currentMaster} onChange={(e) => { setCurrentMaster(e.target.value); clearMessages() }} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.passwordSettings.newAppPassword}</label>
          <input type="password" value={newValue} onChange={(e) => { setNewValue(e.target.value); clearMessages() }} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.passwordSettings.confirmNewAppPassword}</label>
          <input type="password" value={confirmNewValue} onChange={(e) => { setConfirmNewValue(e.target.value); clearMessages() }} className={inputCls} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button onClick={handleChangeAppPassword}>{t.passwordSettings.updateAppPassword}</Button>
      </div>
    </>
  )

  const renderRemoveView = () => (
    <>
      {renderBackButton()}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{t.passwordSettings.currentMasterPassword}</label>
          <input type="password" value={currentMaster} onChange={(e) => { setCurrentMaster(e.target.value); clearMessages() }} className={inputCls} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button variant="danger" onClick={handleRemovePassword}>
          {confirmingRemove ? t.passwordSettings.confirmRemove : t.passwordSettings.removePassword}
        </Button>
      </div>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t.passwordSettings.title}>
      <div className="flex flex-col gap-3">
        {activeView === 'MENU' && renderMenu()}
        {activeView === 'CHANGE_MASTER' && renderChangeMasterView()}
        {activeView === 'CHANGE_APP' && renderChangeAppView()}
        {activeView === 'REMOVE' && renderRemoveView()}
      </div>
    </Modal>
  )
}
