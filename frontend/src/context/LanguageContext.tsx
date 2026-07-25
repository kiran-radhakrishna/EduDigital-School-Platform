import { useEffect, useMemo, useState, type ReactNode } from 'react'
import en, { type Translations } from '../i18n/en'
import de from '../i18n/de'
import { LanguageContext, type Lang } from './language-context'

const translations: Record<Lang, Translations> = { en, de }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    return stored === 'en' || stored === 'de' ? stored : 'en'
  })

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (newLang: Lang) => setLangState(newLang)

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
