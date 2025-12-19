'use client'

import { useState } from "react"

import RolPz from "./RolPz"

export default function RollenPage () {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <RolPz activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
            </div>
        </div>
    )
}
