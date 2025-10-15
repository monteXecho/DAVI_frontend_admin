import Instellingen from "./Instellingen"
import HeaderAdmin from "@/components/layout/HeaderAdmin"

export default function RollenPage () {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="shrink-0">
                <HeaderAdmin />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <Instellingen />
            </div>
        </div>
    )
}
