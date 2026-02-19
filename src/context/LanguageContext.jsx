import { createContext, useContext, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);
const LANGUAGE_KEY = 'appLanguage';

const getStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return stored || 'en';
  } catch {
    return 'en';
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getStoredLanguage());

  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    try {
      localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    } catch {
      // Ignore storage errors.
    }
  };

  const t = (key) => {
    if (!key) return '';
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
