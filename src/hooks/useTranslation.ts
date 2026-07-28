import { useContext } from 'react'
import { LanguageContext } from '../context/LanguageContext'

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider')
  return {
    t: ctx.locale,
    language: ctx.language,
    setLanguage: ctx.setLanguage,
  }
}
