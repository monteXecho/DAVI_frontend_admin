'use client'
import { useState } from "react"

import ComplianceCheckTab from "./components/ComplianceCheckTab"
import CreateVGCTab from "./components/CreateVGCTab"
import { I18nProvider } from "./contexts/i18n/I18nContext"
import { ThemeProvider } from "./contexts/theme/ThemeContext"
import { ToastProvider } from "./ComplianceCheck/contexts/ToastContext"
import ToastContainer from "./ComplianceCheck/components/toast"

const tabsConfig = [
  { label: 'Compliance Check', component: ComplianceCheckTab, selectable: true },
  { label: 'Create VGC List', component: CreateVGCTab, selectable: true },
]

export default function GGD() {
  const [activeIndex, setActiveIndex] = useState(0)

  const ActiveComponent = tabsConfig[activeIndex].component

  const handleTabClick = (index) => {
    const tab = tabsConfig[index]
    if (tab.selectable) {
      setActiveIndex(index)
    }
  }

  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
            <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl">
              GGD Checks
            </div>

            <div className="flex flex-col w-full">
              <div className="pl-24 flex gap-2">
                {tabsConfig.map((tab, index) => {
                  const isActive = activeIndex === index
                  const isSelectable = tab.selectable
                  
                  return (
                    <button
                      key={tab.label}
                      onClick={() => handleTabClick(index)}
                      disabled={!isSelectable}
                      title={!isSelectable ? "Tab niet beschikbaar" : ""}
                      className={`flex justify-center items-center rounded-tl-xl rounded-tr-xl transition-all relative
                        ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA] h-8'}
                        ${isSelectable 
                          ? 'cursor-pointer hover:bg-gray-100' 
                          : 'cursor-not-allowed opacity-60'
                        }
                        w-fit px-4 py-1 font-montserrat font-semibold text-[12px]
                      `}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Active Tab Content */}
              <div className="w-full h-[3px] bg-[#D6F5EB]"></div>
              <div className="w-full px-[102px] py-[46px]">
                <ActiveComponent />
              </div>
            </div>
          </div>
          <ToastContainer />
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}

