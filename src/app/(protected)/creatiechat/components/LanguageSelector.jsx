'use client';

import { useCreativeChatI18n } from "../contexts/CreativeChatI18nContext";

export default function LanguageSelector() {
  const { language, changeLanguage, t } = useCreativeChatI18n();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-600 font-montserrat">
        {t("creativeChat.language")}:
      </span>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent"
      >
        <option value="nl">Nederlands</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
