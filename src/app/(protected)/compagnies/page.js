import CompanyClient from "./CompanyClient";
import HeaderAdmin from "@/components/layout/HeaderAdmin"

export default function CompanyPage() {
  return (
      <div className="flex flex-col h-screen overflow-hidden">
          {/* <div className="shrink-0">
              <HeaderAdmin />
          </div> */}

          <div className="flex-1 overflow-y-auto scrollbar-hide">
              <CompanyClient />
          </div>
      </div>
  )
}
