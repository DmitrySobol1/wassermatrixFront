import { useContext, useMemo } from 'react';
import { LanguageContext } from '@/components/App';
import type { SupportedLanguage } from '@/types/i18n.types';

/**
 * Custom hook for safely retrieving localized texts
 * Falls back to English if the current language is not found in the texts map
 *
 * @param textsMap - Record mapping language codes to text objects
 * @returns The text object for the current language
 *
 * @example
 * const texts = useTexts(TEXTS);
 * console.log(texts.headerT); // "My account"
 */
export function useTexts<T>(textsMap: Record<SupportedLanguage, T>): T {
  const { language } = useContext(LanguageContext);

  // Memoize to prevent unnecessary recalculations
  return useMemo(() => {
    const validLanguage = language as SupportedLanguage;
    return textsMap[validLanguage] || textsMap.en;
  }, [language, textsMap]);
}
