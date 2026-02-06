import ModulesDetail from "../ModulesDetail";

export default function ModulesDetailPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <ModulesDetail />
      </div>
    </div>
  );
}

