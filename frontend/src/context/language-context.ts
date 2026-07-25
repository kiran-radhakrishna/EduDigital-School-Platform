import { createContext } from 'react'
import type { Translations } from '../i18n/en'

export type Lang = 'en' | 'de'

export interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)
