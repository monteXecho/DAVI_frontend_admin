import React, { createContext, useContext, useMemo, useState } from "react";

// Supported languages
const SUPPORTED_LANGS = ["en", "nl"];
const DEFAULT_LANG = "nl";

// Simple translations dictionary
const translations = {
  en: {
    "app.title": "Creative Writing Assistant",
    "app.subtitle": "Draft, rewrite, and brainstorm with AI assistance",

    "chat.welcomeTitle": "👋 Welcome!",
    "chat.welcomeBody":
      "Select a task type and start chatting to get creative assistance.",
    "chat.send": "Send",
    "chat.placeholder": "Type your message for {{task}}...",

    "task.draft": "Draft",
    "task.rewrite": "Rewrite",
    "task.brainstorm": "Brainstorm",

    "lang.label": "Language",
    "lang.en": "English",
    "lang.nl": "Dutch",

    "error.generic": "Error: {{message}}",
  },
  nl: {
    "app.title": "Creatieve Schrijfassistent",
    "app.subtitle": "Schrijf, herschrijf en brainstorm met hulp van AI",

    "chat.welcomeTitle": "👋 Welkom!",
    "chat.welcomeBody":
      "Kies een taaktype en start het gesprek om creatieve hulp te krijgen.",
    "chat.send": "Versturen",
    "chat.placeholder": "Typ je bericht voor {{task}}...",

    "task.draft": "Schrijven",
    "task.rewrite": "Herschrijven",
    "task.brainstorm": "Brainstormen",

    "lang.label": "Taal",
    "lang.en": "Engels",
    "lang.nl": "Nederlands",

    "error.generic": "Fout: {{message}}",
  },
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(DEFAULT_LANG);

  const value = useMemo(() => {
    const t = (key, vars) => {
      const dict = translations[lang] || translations[DEFAULT_LANG];
      let text = dict[key] || translations[DEFAULT_LANG][key] || key;

      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replaceAll(`{{${k}}}`, String(v));
        });
      }

      return text;
    };

    return {
      lang,
      setLang: (next) => {
        if (SUPPORTED_LANGS.includes(next)) {
          setLang(next);
        }
      },
      t,
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
};

export const useTaskLabel = (taskType) => {
  const { t } = useI18n();
  if (taskType === "rewrite") return t("task.rewrite");
  if (taskType === "brainstorm") return t("task.brainstorm");
  return t("task.draft");
};
