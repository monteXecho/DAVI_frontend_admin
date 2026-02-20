"use client";

import { useState, useRef } from "react";
import { useCreativeChatI18n } from "../contexts/CreativeChatI18nContext";
import ChatSubmitIcon from "./icons/ChatSubmitIcon";

const TONE_OPTIONS = ["Schrijven", "Herschrijven", "Brainstormen", "SMART"];

export default function CreativeChatInput({ onSubmit, onCancel, loading }) {
  const { t } = useCreativeChatI18n();
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("Schrijven");
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (loading) return;
    if (!input.trim()) return;
    onSubmit(input.trim(), tone);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (loading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full rounded-xl border border-[#23BD92] overflow-hidden bg-white font-montserrat">
      {/* Text area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          placeholder={t("creativeChat.placeholder")}
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
          }}
          disabled={loading}
          className="w-full px-4 pt-4 pb-2 resize-none overflow-hidden font-montserrat text-[16px] leading-6 text-[#342222] placeholder:text-slate-400 focus:outline-none min-h-[80px] disabled:opacity-70 disabled:cursor-not-allowed"
        />
        {loading ? (
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 size-6 border border-[#757575] rounded-full flex items-center justify-center cursor-pointer"
            aria-label={t("creativeChat.cancel")}
          >
            <div className="size-3 bg-[#23BD92]"></div>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="absolute right-4 top-4 size-6 flex items-center justify-center cursor-pointer disabled:opacity-50"
            aria-label={t("creativeChat.submit")}
          >
            <ChatSubmitIcon
              size={24}
              color={!input.trim() ? "#757575" : "#23BD92"}
            />
          </button>
        )}
      </div>

      {/* Options row + Language + Submit - matches page-no chat.svg / page-mobile view.svg */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#D6F5EB] border-t border-[#23BD92]">
        {/* Tone options: select on small, buttons on lg+ */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="lg:hidden min-w-0 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#23BD92]"
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(`creativeChat.options.${opt}`)}
              </option>
            ))}
          </select>
          <div className="hidden lg:flex gap-4">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTone(opt)}
                className="flex items-center gap-1.5 rounded-full text-sm font-medium transition-colors text-black"
              >
                <span className="size-4 rounded-full border border-[#757575] bg-white flex items-center justify-center">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      tone === opt ? "bg-[#1E1E1E]" : "bg-white"
                    }`}
                  />
                </span>
                {t(`creativeChat.options.${opt}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Language + Submit */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-4">
          <CreativeChatInput.LanguageSelector />
        </div>
      </div>
    </div>
  );
}

CreativeChatInput.LanguageSelector = function LanguageSelectorInline() {
  const { language, changeLanguage, t } = useCreativeChatI18n();
  return (
    <div className="flex items-center">
      <button
        className={`px-2 pt-1 pb-0.5 rounded-s-lg border border-[#23BD92] ${
          language === "nl" ? "bg-[#23BD92] text-white" : "text-[#23BD92]"
        }`}
        onClick={() => changeLanguage("nl")}
      >
        Nederlands
      </button>
      <button
        className={`px-2 pt-1 pb-0.5 rounded-e-lg border border-[#23BD92] ${
          language === "en" ? "bg-[#23BD92] text-white" : "text-[#23BD92]"
        }`}
        onClick={() => changeLanguage("en")}
      >
        English
      </button>
    </div>
  );
};
