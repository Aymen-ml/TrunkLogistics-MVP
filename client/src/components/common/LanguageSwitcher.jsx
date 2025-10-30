import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle language"
      title={i18n.language === 'en' ? 'Switch to French' : 'Passer en anglais'}
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase font-semibold">{i18n.language === 'en' ? 'FR' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;
