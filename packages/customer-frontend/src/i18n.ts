import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend'; // Use http backend to load files

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    // Debugging: Set to true to see logs
    debug: process.env.NODE_ENV === 'development', 
    
    // Default language
    fallbackLng: 'am', 
    
    // Supported languages
    supportedLngs: ['en', 'am', 'om'], 

    // Namespace configuration (optional for now, default is 'translation')
    // ns: ['translation'],
    // defaultNS: 'translation',

    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    
    // Backend options (loading from /public/locales)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
    
    // Language detector options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      // Cache user language choice in localStorage
      caches: ['localStorage'], 
    },

    // React-i18next specific options
    react: {
      useSuspense: true, // Recommended with React.lazy/Suspense
    }
  });

export default i18n; 