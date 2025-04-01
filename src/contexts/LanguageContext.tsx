import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => { },
  t: () => '',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Définir le français comme langue par défaut
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Mettre à jour l'attribut lang du document
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, params?: Record<string, string>) => {
    // Diviser la clé par points pour accéder aux propriétés imbriquées
    const keys = key.split('.');
    let value: any = translations[language];

    // Parcourir l'objet de traductions
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    // Si pas de traduction trouvée, retourner la clé
    if (!value) return key;

    // Remplacer les paramètres si présents
    if (params) {
      return Object.entries(params).reduce(
        (str, [key, value]) => str.replace(`{${key}}`, value),
        value
      );
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);