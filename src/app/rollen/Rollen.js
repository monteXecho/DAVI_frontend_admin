'use client'
import { useState, useEffect, useCallback } from "react"

import { useApi } from "@/lib/useApi"
import AlleRollenTab from "./components/AlleRollenTab"
import MakenTab from "./components/MakenTab"
// import ToewijzenTab from "./components/ToewijzenTab"
// import VersturenTab from "./components/VersturenTab"
import WijzigenTab from "./components/WijzigenTab"

const tabsConfig = [
  { label: 'Alle rollen', component: AlleRollenTab },
  { label: 'Maken', component: MakenTab },
//   { label: 'Toewijzen', component: ToewijzenTab },
  { label: 'Wijzigen', component: WijzigenTab },
//   { label: 'Versturen', component: VersturenTab },
]

export default function Rollen () {
    const [activeIndex, setActiveIndex] = useState(0)
    const { getCompanyStats } = useApi()
    const [ cadmins, setCadmins ] = useState()
    const [ cusers, setCusers ] = useState()
    const [ adocs, setAdocs ] = useState()
    const [ udocs, setUdocs ] = useState()

    const ActiveComponent = tabsConfig[activeIndex].component

    const fetchCompanyStats = useCallback (async () => {
        try {
            const data = await getCompanyStats()
            setCadmins(data.company_admin_count)
            setCusers(data.company_user_count)
            setAdocs(data.documents_for_admins)
            setUdocs(data.documents_for_users)
        } catch(err) {
            console.log("Failed to fetch company stats.")
        }
    }, [getCompanyStats])

    useEffect (() => {
        fetchCompanyStats()
    }, [fetchCompanyStats])

    return (
        <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
           <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl leading-[100%] tracking-[0]">
                Rollen
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
                    <ActiveComponent admin_counts={cadmins} user_counts={cusers} admin_docs={adocs} user_docs={udocs}/>
                </div>
            </div>
        </div>
    )
}
