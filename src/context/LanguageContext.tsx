import { createContext, useState, useCallback, type ReactNode } from 'react'
import { tr } from '../locales/tr'
import { en } from '../locales/en'
import type { Locale } from '../locales/tr'
import { getLanguage, setLanguage as persistLanguage } from '../Services/configService'

interface LanguageContextValue {
  locale: Locale
  language: 'tr' | 'en'
  setLanguage: (lang: 'tr' | 'en') => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'tr' | 'en'>(() => getLanguage())

  const setLanguage = useCallback((lang: 'tr' | 'en') => {
    setLanguageState(lang)
    persistLanguage(lang)
  }, [])

  const locale = language === 'en' ? en : tr

  return (
    <LanguageContext.Provider value={{ locale, language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
