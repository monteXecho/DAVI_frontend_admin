import Bronnen from "./Bronnen"

export default function BronnenPage() {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <Bronnen />
            </div>
        </div>
    )
}


