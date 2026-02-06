import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
      <div className="flex flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
              <DashboardClient />
          </div>
      </div>
  )
}
