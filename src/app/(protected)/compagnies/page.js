import CompanyClient from "./CompanyClient";

export default function CompanyPage() {
  return (
      <div className="flex flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
              <CompanyClient />
          </div>
      </div>
  )
}
