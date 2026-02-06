import CompanyEdit from "../CompanyEdit";

export default function CompanyEditPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <CompanyEdit />
      </div>
    </div>
  );
}

