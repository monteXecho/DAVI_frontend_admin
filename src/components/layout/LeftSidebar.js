'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useKeycloak } from "@react-keycloak/web";
import { useApi } from "@/lib/useApi";

import logoutItem from "@/assets/Vector.png";
import MenuButton from "@/components/buttons/MenuButton";

import ChatItem from "@/assets/chat_item.png";
import VGCItem from "@/assets/VGC_item.png";
import RollenItem from "@/assets/rollen_item.png";
import GebruikersItem from "@/assets/gebruikers_item.png";
import DocumentenItem from "@/assets/documenten_item.png";
import CompanyItem from "@/assets/company_item.png";

const MENU_CONFIG = {
  publicModules: [
    {
      id: 'documentenchat',
      label: 'Documentenchat',
      icon: ChatItem,
      path: '/documentchat',
      moduleKey: 'Documenten chat'
    },
    {
      id: 'ggd-checks',
      label: 'GGD Checks',
      icon: VGCItem,
      path: '/GGD',
      moduleKey: 'GGD Checks'
    }
  ],
  adminModules: [
    {
      id: 'companies',
      label: 'Compagnies',
      icon: CompanyItem,
      path: '/compagnies',
      requiredRole: 'super_admin'
    },
    {
      id: 'roles',
      label: 'Rollen',
      icon: RollenItem,
      path: '/rollen',
      requiredRoles: ['super_admin', 'company_admin']
    },
    {
      id: 'users',
      label: 'Gebruikers',
      icon: GebruikersItem,
      path: '/gebruikers',
      requiredRoles: ['super_admin', 'company_admin']
    },
    {
      id: 'documents',
      label: 'Documenten',
      icon: DocumentenItem,
      path: '/documenten',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ]
};

export default function LeftSidebar() {
  const { getUser } = useApi();
  const [activeTab, setActiveTab] = useState('Documentenchat');
  const router = useRouter();
  const pathname = usePathname();
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = useMemo(() => 
    initialized && keycloak?.authenticated, 
  [initialized, keycloak?.authenticated]);

  const userRoles = useMemo(() => {
    if (!isAuthenticated) {
      return {
        isSuperAdmin: false,
        isCompanyAdmin: false,
        isCompanyUser: false
      };
    }

    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    
    const roleState = {
      isSuperAdmin: roles.includes("super_admin"),
      isCompanyAdmin: roles.includes("company_admin"),
      isCompanyUser: roles.includes("company_user")
    };

    return roleState;
  }, [isAuthenticated, keycloak?.tokenParsed]);

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const loginUser = await getUser();
      if (loginUser) {
        setUser(loginUser);
      }
    } catch (err) {
      console.error("Failed to fetch user info: ", err);
      setError(err);
    } finally {
      setLoading(false);
    }  
  }, [getUser, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser, isAuthenticated]);

  const filteredPublicModules = useMemo(() => {
    if (userRoles.isSuperAdmin) return MENU_CONFIG.publicModules;

    if (!user || !user.modules) return [];
    
    
    const enabledModules = MENU_CONFIG.publicModules.filter(module => {
      const moduleConfig = user.modules[module.moduleKey];
      
      const isEnabled = moduleConfig && moduleConfig.enabled === true;
      
      return isEnabled;
    });

    return enabledModules;
  }, [user, userRoles.isSuperAdmin]);

  const filteredAdminModules = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    if (userRoles.isSuperAdmin) return MENU_CONFIG.adminModules;
    

    const modules = MENU_CONFIG.adminModules.filter(module => {
      if (module.requiredRole === 'super_admin') {
        return userRoles.isSuperAdmin;
      }
      
      if (module.requiredRoles) {
        return module.requiredRoles.some(role => {
          if (role === 'super_admin') return userRoles.isSuperAdmin;
          if (role === 'company_admin') return userRoles.isCompanyAdmin;
          return false;
        });
      }
      
      return true;
    });

    return modules;
  }, [userRoles, isAuthenticated]);

  const defaultRoute = useMemo(() => {
    if (userRoles.isSuperAdmin) return "/documentchat";
    

    if (filteredPublicModules.length > 0) {
      const firstPublicModule = filteredPublicModules[0];
      return firstPublicModule.path;
    }
    
    if (filteredAdminModules.length > 0) {
      const firstAdminModule = filteredAdminModules[0];
      return firstAdminModule.path;
    }
    
    return null;
  }, [filteredPublicModules, filteredAdminModules, userRoles.isSuperAdmin]);

  const routeToTab = useMemo(() => {
    const mapping = {
      "/documentchat": "Documentenchat",
      "/GGD": "GGD Checks",
      "/compagnies": "Compagnies",
      "/rollen": "Rollen",
      "/rol-pz": "Rollen",
      "/gebruikers": "Gebruikers",
      "/documenten": "Documenten",
    };
    
    if (defaultRoute) {
      mapping["/"] = mapping[defaultRoute] || "Documentenchat";
    } else {
      mapping["/"] = "Documentenchat";
    }
    
    return mapping;
  }, [defaultRoute]);

  useEffect(() => {
    if (pathname === '/' && defaultRoute && defaultRoute !== '/' && !userRoles.isSuperAdmin) {
      router.push(defaultRoute);
    }
  }, [pathname, defaultRoute, router, userRoles.isSuperAdmin]);

  useEffect(() => {
    const tab = routeToTab[pathname] || null;
    setActiveTab(tab);
  }, [pathname, routeToTab]);

  const handleLogout = useCallback(() => {
    if (keycloak?.authenticated) {
      keycloak.logout({ redirectUri: window.location.origin });
    } else {
      router.push("/");
    }
  }, [keycloak, router]);

  const handleClick = useCallback((label) => {
    setActiveTab(label);

    const routes = {
      Documentenchat: "/documentchat",
      "GGD Checks": "/GGD",
      Rollen: "/rollen",
      Compagnies: "/compagnies",
      Gebruikers: "/gebruikers",
      Documenten: "/documenten",
    };

    if (label === "Afmelden") {
      handleLogout();
      return;
    }

    const route = routes[label];
    if (route) router.push(route);
  }, [router, handleLogout]);

  if (!initialized) {
    return (
      <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
        <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <div className="font-extrabold text-[40px] leading-none tracking-normal font-montserrat text-[#23BD92]">
            DAVI
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#23BD92]"></div>
            <span className="text-sm text-gray-600">Initializing...</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
        <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <div className="font-extrabold text-[40px] leading-none tracking-normal font-montserrat text-[#23BD92]">
            DAVI
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#23BD92]"></div>
            <span className="text-sm text-gray-600">Loading user data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
        <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <div className="font-extrabold text-[40px] leading-none tracking-normal font-montserrat text-[#23BD92]">
            DAVI
          </div>
          <div className="text-gray-500 text-sm text-center">
            Please log in
          </div>
        </div>
        <div className="w-full pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <MenuButton
            text="Login"
            image={logoutItem}
            isActive={false}
            onClick={() => router.push("/")}
          />
        </div>
      </div>
    );
  }

  const hasPublicModules = filteredPublicModules.length > 0;
  const hasAdminModules = filteredAdminModules.length > 0;
  const hasAnyModules = hasPublicModules || hasAdminModules;

  return (
    <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
      <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        <div
          className="font-extrabold text-[40px] leading-none tracking-normal font-montserrat text-[#23BD92] cursor-pointer"
          onClick={() => {
            if (defaultRoute) {
              router.push(defaultRoute);
            } else {
              router.push("/");
            }
            setActiveTab(null);
          }}
        >
          DAVI
        </div>

        <div className="flex flex-col gap-6">
          {hasPublicModules && (
            <>
              <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
                {filteredPublicModules.map((module) => (
                  <MenuButton
                    key={module.id}
                    text={module.label}
                    image={module.icon}
                    isActive={activeTab === module.label}
                    onClick={() => handleClick(module.label)}
                  />
                ))}
              </div>
              
              {hasAdminModules && (
                <div className="w-full h-px bg-[#C5BEBE]"></div>
              )}
            </>
          )}

          {hasAdminModules && (
            <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
              {filteredAdminModules.map((module) => (
                <MenuButton
                  key={module.id}
                  text={module.label}
                  image={module.icon}
                  isActive={activeTab === module.label}
                  onClick={() => handleClick(module.label)}
                />
              ))}
            </div>
          )}

          {!hasAnyModules && (
            <div className="text-gray-500 text-sm text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
              <p>No modules available for your account</p>
              <p className="text-xs mt-1">
                Contact administrator to enable modules
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        <MenuButton
          text="Afmelden"
          image={logoutItem}
          isActive={activeTab === "Afmelden"}
          onClick={() => handleClick("Afmelden")}
        />
      </div>
    </div>
  );
}
