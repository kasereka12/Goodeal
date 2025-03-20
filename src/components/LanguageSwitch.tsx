import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
      title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <img
        src={`https://flagcdn.com/${language === 'fr' ? 'fr' : 'gb'}.svg`}
        alt={language === 'fr' ? 'Français' : 'English'}
        className="w-5 h-4 object-cover rounded"
      />
    </button>
  );
}