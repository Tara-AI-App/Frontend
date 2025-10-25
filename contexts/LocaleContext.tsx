"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Locale = 'en' | 'id'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Simple translation function
const translations: Record<Locale, Record<string, any>> = {
  en: require('../messages/en.json'),
  id: require('../messages/id.json')
}

// Helper function to get nested translation
function getNestedTranslation(obj: any, path: string): string {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return path // Return the key if translation not found
    }
  }

  return typeof result === 'string' ? result : path
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage or default to 'en'
  const [locale, setLocaleState] = useState<Locale>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'id')) {
      setLocaleState(savedLocale)
    }
    setIsLoaded(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    // Update HTML lang attribute
    document.documentElement.lang = newLocale
  }

  const t = (key: string): string => {
    return getNestedTranslation(translations[locale], key)
  }

  // Don't render until locale is loaded from localStorage
  if (!isLoaded) {
    return null
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
