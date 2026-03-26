import CompanyDashboardClient from './CompanyDashboardClient';

export default function CompanyDashboardPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <CompanyDashboardClient />
      </div>
    </div>
  );
}
