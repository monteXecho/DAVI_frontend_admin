import Documenten from "./Documents"
import HeaderAdmin from "@/components/layout/HeaderAdmin"

export default function RollenPage () {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Fixed height header */}
            <div className="shrink-0">
                <HeaderAdmin />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <Documenten />
            </div>
        </div>
    )
}
