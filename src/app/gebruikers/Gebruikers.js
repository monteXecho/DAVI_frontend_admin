'use client'
import { useState } from "react"

import GebruikersTab from "./components/GebruikersTab"
import MakenTab from "./components/MakenTab"
import GekoppeldDocumentTab from "./components/GekoppeldDocumentTab"
import GekoppeldMapTab from "./components/GekoppeldMapTab"
import WijzigenTab from "./components/WijzigenTab"

const tabsConfig = [
  { label: 'Gebruikers', component: GebruikersTab },
  { label: 'Maken', component: MakenTab },
  { label: 'Wijzigen', component: WijzigenTab },
  { label: 'Gekoppeld aan document', component: GekoppeldDocumentTab },
  { label: 'Gekoppeld aan map', component: GekoppeldMapTab },
]

export default function Gebruikers () {
    const [activeIndex, setActiveIndex] = useState(0)

    const ActiveComponent = tabsConfig[activeIndex].component

    return (
        <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
           <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl leading-[100%] tracking-[0]">
                Gebruikers
            </div>

            <div className="flex flex-col w-full">
                <div className="flex flex-col w-full">
                    <div className="pl-24 flex gap-2">
                        {tabsConfig.map((tab, index) => {
                            const isActive = activeIndex === index
                            return (
                            <button
                                key={tab.label}
                                onClick={() => setActiveIndex(index)}
                                className={`flex justify-center items-center rounded-tl-xl rounded-tr-xl transition-all
                                ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA] h-[32px]'}
                                w-fit px-4 py-1 font-montserrat font-semibold text-[12px] leading-[24px] tracking-[0]
                                `}
                            >
                                {tab.label}
                            </button>
                            )
                        })}
                    </div>
                    <div className="w-full h-[3px] bg-[#D6F5EB]"></div>
                </div>
                <div className="w-full px-[102px] py-[46px]">
                    <ActiveComponent />
                </div>
            </div>
        </div>
    )
}
