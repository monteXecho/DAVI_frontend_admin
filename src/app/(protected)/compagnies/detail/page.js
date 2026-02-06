import CompaniesDetail from "../CompaniesDetail";

export default function CompaniesDetailPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <CompaniesDetail />
      </div>
    </div>
  );
}

