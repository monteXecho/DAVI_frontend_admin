import React from "react";
import { useI18n } from "../i18nContext.jsx";

const LanguageSelector = () => {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="flex items-center justify-end bg-white border-b border-gray-200 px-4 py-2 mb-4 rounded-t-lg">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="font-medium">{t("lang.label")}:</span>
        <button
          type="button"
          onClick={() => setLang("nl")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            lang === "nl"
              ? "bg-[#23BD92] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("lang.nl")}
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            lang === "en"
              ? "bg-[#23BD92] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("lang.en")}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
