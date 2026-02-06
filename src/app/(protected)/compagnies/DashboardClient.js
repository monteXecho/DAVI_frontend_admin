'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import DashboardCard from "./components/DashboardCard";
import { BuildingIcon, CompanyAdminIcon, PersonIcon, PeopleIcon, DocumentIcon, LightningIcon, SettingsIcon, RoleIcon, ModuleIcon } from "./components/DashboardIcons";

export default function DashboardClient() {
  const router = useRouter();
  const { getSuperAdminStats, getCompanies, error } = useApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Try to get stats from API, if not available, calculate from companies
        let statsData;
        
        // Check if we've previously determined the endpoint doesn't exist
        // This prevents repeated 404 errors in console
        const statsEndpointAvailable = typeof window !== 'undefined' 
          ? window.sessionStorage.getItem('superAdminStatsEndpointAvailable')
          : null;
        
        if (statsEndpointAvailable === 'false') {
          // Endpoint doesn't exist, skip the request and go straight to fallback
          statsData = null;
        } else {
          try {
            statsData = await getSuperAdminStats();
            // Mark endpoint as available if request succeeds
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('superAdminStatsEndpointAvailable', 'true');
            }
          } catch (err) {
            // If endpoint doesn't exist yet (404) or access denied (403), calculate from companies data
            // Mark endpoint as unavailable to prevent future requests
            if ((err.is404 || err.response?.status === 404) && typeof window !== 'undefined') {
              window.sessionStorage.setItem('superAdminStatsEndpointAvailable', 'false');
            }
            // Silently handle 404/403 errors as they're expected if endpoint doesn't exist
            if (!err.silent && err.response?.status !== 404 && err.response?.status !== 403) {
              console.error('Error fetching super admin stats:', err);
            }
            statsData = null;
          }
        }
        
        if (!statsData) {
          const companies = await getCompanies();
          const companiesList = Array.isArray(companies) ? companies : companies.companies || [];
          
          // Calculate stats from companies data
          let totalAdmins = 0;
          let totalTeamMembers = 0;
          let totalUsers = 0;
          let totalDocuments = 0;
          let totalModules = 0;
          let onlineUsers = 0; // This would need to come from a different endpoint
          let unlimitedUsers = 0;
          let unlimitedAdmins = 0;
          let unlimitedDocuments = 0;
          
          companiesList.forEach(company => {
            totalAdmins += company.admins?.length || 0;
            // Count users from company.users array if available
            const companyUsers = company.users?.length || 0;
            totalUsers += companyUsers;
            // Count team members - users with teamlid permissions (would need API to check is_teamlid flag)
            // For now, we'll use a placeholder that the API should provide
            totalTeamMembers += Math.floor(companyUsers * 0.8); // Estimate: most users are team members
            
            // Count documents from admins and users
            company.admins?.forEach(admin => {
              totalDocuments += admin.documents?.length || 0;
              // Count enabled modules
              if (admin.modules) {
                const moduleCount = Object.values(admin.modules).filter(m => m && m.enabled === true).length;
                totalModules += moduleCount;
              }
            });
            company.users?.forEach(user => {
              totalDocuments += user.documents?.length || 0;
            });
          });
          
          statsData = {
            companies: companiesList.length,
            company_admins: totalAdmins,
            team_members: totalTeamMembers,
            users: totalUsers,
            online_users: onlineUsers,
            max_users: 4096,
            max_admins: 4096,
            max_roles: 512,
            modules_activated: totalModules,
            total_documents: totalDocuments,
            max_documents: 1048576,
            unlimited_users: unlimitedUsers,
            unlimited_admins: unlimitedAdmins,
            unlimited_documents: unlimitedDocuments
          };
        }
        
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getSuperAdminStats, getCompanies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-[#23BD92] border-r-[#23BD92] border-b-transparent border-l-transparent" />
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent border-r-transparent border-b-[#D6F5EB] border-l-[#D6F5EB] opacity-20" />
          </div>
          <div className="font-montserrat text-[#23BD92] text-lg font-semibold animate-pulse">
            Dashboard laden...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border-2 border-red-200 bg-red-50 px-6 py-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-red-900 text-lg mb-1">Fout bij laden</h3>
                <p className="font-montserrat text-red-700 text-sm">
                  Er is een fout opgetreden bij het laden van de dashboard statistieken. Probeer het later opnieuw.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full h-full p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 px-6 py-5 shadow-sm">
            <p className="font-montserrat text-gray-600 text-sm">
              Geen statistieken beschikbaar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#23BD92] to-[#1ea87c] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-montserrat bg-gradient-to-r from-[#23BD92] to-[#1ea87c] bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-montserrat mt-1">
                  Overzicht van alle bedrijven en resources
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Grid - 3 columns, 4 rows, last row has 2 tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* Row 1 - 3 tiles */}
          <div 
            onClick={() => router.push('/compagnies/detail')}
            className="cursor-pointer"
          >
            <DashboardCard
              number={stats.companies || 0}
              label="Bedrijven"
              icon={<BuildingIcon />}
            />
          </div>
          <DashboardCard
            number={stats.company_admins || 0}
            label="Bedrijfs-admins"
            icon={<CompanyAdminIcon />}
          />
          <DashboardCard
            number={stats.team_members || 0}
            label="Teamleden"
            icon={<PeopleIcon />}
          />

          {/* Row 2 - 3 tiles */}
          <DashboardCard
            number={stats.users || 0}
            label="Gebruikers"
            icon={<PersonIcon />}
            subtitle={{
              text: `${stats.online_users || 0} online`,
              icon: <LightningIcon />
            }}
          />
          <DashboardCard
            number={stats.max_users || 0}
            label="Maximum gebruikers mogelijk"
            unlimitedCount={stats.unlimited_users || 0}
            icon={<SettingsIcon />}
          />
          <DashboardCard
            number={stats.max_admins || 0}
            label="Maximum admins mogelijk"
            unlimitedCount={stats.unlimited_admins || 0}
            icon={<SettingsIcon />}
          />

          {/* Row 3 - 3 tiles */}
          <DashboardCard
            number={stats.max_roles || 0}
            label="Maximum rollen mogelijk"
            icon={<RoleIcon />}
          />
          <DashboardCard
            number={stats.max_roles || 0}
            label="Maximum rollen mogelijk"
            icon={<RoleIcon />}
          />
          <div 
            onClick={() => router.push('/compagnies/modules')}
            className="cursor-pointer"
          >
            <DashboardCard
              number={stats.modules_activated || 0}
              label="Modules geactiveerd"
              icon={<ModuleIcon />}
            />
          </div>

          {/* Row 4 - 2 tiles (centered on large screens) */}
          <DashboardCard
            number={stats.total_documents || 0}
            label="Totaal documenten opgeslagen"
            icon={<DocumentIcon />}
          />
          <DashboardCard
            number={stats.max_documents || 0}
            label="Maximum documenten mogelijk"
            icon={<DocumentIcon />}
            unlimitedCount={stats.unlimited_documents || 0}
          />
        </div>
      </div>
    </div>
  );
}
