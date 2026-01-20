import GGD from "./GGD"

export default function GGDPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <GGD />
      </div>
    </div>
  )
}

