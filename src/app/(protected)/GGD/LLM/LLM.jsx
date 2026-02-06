import React from 'react'
import Chat from './components/Chat'
import LanguageSelector from './components/LanguageSelector.jsx'
import { I18nProvider } from "./i18nContext.jsx";

function LLM() {
  return (
    <I18nProvider>
      <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <LanguageSelector />
        <div className="flex-1 min-h-0">
          <Chat />
        </div>
      </div>
    </I18nProvider>
  )
}

export default LLM
