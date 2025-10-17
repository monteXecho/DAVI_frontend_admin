'use client'
import { useState, useEffect, useCallback } from "react"

import AlleDocumentenTab from "./components/AllDocumentsTab"
import UsersTab from "./components/UsersTab"
import AppearInRoleTab from "./components/AppearInRoleTab"
import GekoppeldDocumentTab from "./components/AppearInFolderTab"
import ToevoegenTab from "./components/ToevoegenTab"
import { useApi } from "@/lib/useApi"

const tabsConfig = [
  { label: 'Alle documenten', component: AlleDocumentenTab },
  { label: 'Toevoegen', component: ToevoegenTab },
  { label: 'Gebruikers', component: UsersTab },
  { label: 'Komt voor bij rol', component: AppearInRoleTab },
  { label: 'Komt voor in map', component: GekoppeldDocumentTab },
]

export default function Documents () {
    const [ activeIndex, setActiveIndex ] = useState(0)
    const [ roles, setRoles ] = useState([])
    const { getRoles, uploadDocumentForRole } = useApi()

    const ActiveComponent = tabsConfig[activeIndex].component

    const fetchRoles = useCallback(async () => {
    try {
        const res = await getRoles()
        if (res?.roles) {
        setRoles(res.roles)
        }
    } catch (err) {
        console.error("❌ Failed to fetch roles:", err)
    }
    }, [getRoles])

    useEffect(() => {
        fetchRoles()
    }, [fetchRoles])

    const hanldeUploadDocument = async ( selectedRole, selectedFolder, formData ) => {
        try {
            await uploadDocumentForRole(selectedRole, selectedFolder, formData)
        } catch (err) {
            console.error("❌ Failed to upload documnt for Role:", err)
        }
    }

    return (
        <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
           <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl leading-[100%] tracking-[0]">
                Documenten
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
                    <ActiveComponent roles={roles} onUploadDocument={hanldeUploadDocument}/>
                </div>
            </div>
        </div>
    )
}
