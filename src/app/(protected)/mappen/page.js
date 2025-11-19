import Documenten from "./Mappen"

export default function RollenPage () {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <Documenten />
            </div>
        </div>
    )
}
