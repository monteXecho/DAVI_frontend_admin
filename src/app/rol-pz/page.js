'use client'

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import RolPz from "./RolPz"
import HeaderAdmin from "@/components/layout/HeaderAdmin"

export default function RollenPage () {
    const [activeIndex, setActiveIndex] = useState(0)
    const router = useRouter()
    const pathname = usePathname()

    const handleOpenDocuments = () => {
        if (pathname === "/rol-pz") {
            setActiveIndex(1)
        } else {
            router.push("/rol-pz?tab=1")
        }
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="shrink-0">
                <HeaderAdmin onOpenDocuments={handleOpenDocuments} />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <RolPz activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
            </div>
        </div>
    )
}
