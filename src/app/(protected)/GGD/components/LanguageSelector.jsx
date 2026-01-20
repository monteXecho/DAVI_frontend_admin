import { useI18n } from "../contexts/i18n/I18nContext";

export default function LanguageSelector() {
  const { language, changeLanguage } = useI18n();

  const languages = [
    { code: "en", label: "English" },
    { code: "nl", label: "Nederlands" },
  ];

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#23BD92]"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}

