'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import GrayFolderIcon from "@/components/icons/GrayFolderIcon"

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
    },
    {
      id: 'mappen',
      label: 'Mappen',
      icon: GrayFolderIcon,
      path: '/mappen',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ]
};

const useStableCallbacks = () => {
  const map = useRef(new Map());
  const getStable = useCallback((key, fn) => {
    if (!map.current.has(key)) map.current.set(key, fn);
    return map.current.get(key);
  }, []);
  return getStable;
};

export default function LeftSidebar() {

  const router = useRouter();
  const pathname = usePathname();
  const { keycloak, initialized } = useKeycloak();
  const { getUser } = useApi();

  const [user, setUser] = useState(null);
  const userRef = useRef(null);          
  const [loading, setLoading] = useState(true);
  const getStable = useStableCallbacks();
  const [activeTab, setActiveTab] = useState("Documentenchat");

  const isAuthenticated = useMemo(
    () => initialized && keycloak?.authenticated,
    [initialized, keycloak?.authenticated]
  );

  const userRoles = useMemo(() => {
    if (!isAuthenticated) return {
      isSuperAdmin: false,
      isCompanyAdmin: false,
      isCompanyUser: false
    };

    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];

    return {
      isSuperAdmin: roles.includes("super_admin"),
      isCompanyAdmin: roles.includes("company_admin"),
      isCompanyUser: roles.includes("company_user")
    };
  }, [isAuthenticated, keycloak?.tokenParsed]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (userRef.current) {
      setUser(userRef.current);
      setLoading(false);
      return;
    }

    const loadUserOnce = async () => {
      setLoading(true);
      try {
        const loginUser = await getUser();
        if (loginUser) {
          userRef.current = loginUser;           
          setUser(prev => prev ?? loginUser);    
        }
      } catch (err) {
        console.error("User fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserOnce();
  }, [isAuthenticated, getUser]);

  const stableUser = userRef.current;  

  const { filteredPublicModules, filteredAdminModules } = useMemo(() => {
    const publicModules = userRoles.isSuperAdmin
      ? MENU_CONFIG.publicModules
      : MENU_CONFIG.publicModules.filter(module => {
          const moduleInfo = stableUser?.modules?.[module.moduleKey];
          return moduleInfo?.enabled === true;
        });

    const adminModules = !isAuthenticated
      ? []
      : userRoles.isSuperAdmin
      ? MENU_CONFIG.adminModules
      : MENU_CONFIG.adminModules.filter(module => {
          if (module.requiredRole === "super_admin")
            return userRoles.isSuperAdmin;
          if (module.requiredRoles)
            return module.requiredRoles.some(role =>
              role === "super_admin"
                ? userRoles.isSuperAdmin
                : role === "company_admin"
                ? userRoles.isCompanyAdmin
                : false
            );
          return true;
        });

    return { filteredPublicModules: publicModules, filteredAdminModules: adminModules };
  }, [stableUser, userRoles, isAuthenticated]);

  const routeToTab = useMemo(() => {
    const map = {
      "/documentchat": "Documentenchat",
      "/documentchat/mijn": "Documentenchat", // Add this line
      "/GGD": "GGD Checks",
      "/compagnies": "Compagnies",
      "/rollen": "Rollen",
      "/rol-pz": "Rollen",
      "/gebruikers": "Gebruikers",
      "/documenten": "Documenten",
      "/mappen": "Mappen"
    };

    map["/"] =
      filteredPublicModules[0]?.label ||
      filteredAdminModules[0]?.label ||
      "Documentenchat";

    return map;
  }, [filteredPublicModules, filteredAdminModules]);

  useEffect(() => {
    if (pathname === "/" && !userRoles.isSuperAdmin) {
      const defaultRoute =
        filteredPublicModules[0]?.path ||
        filteredAdminModules[0]?.path ||
        "/documentchat";

      router.push(defaultRoute);
    }
  }, [pathname, filteredPublicModules, filteredAdminModules, userRoles.isSuperAdmin, router]);

  useEffect(() => {
    setActiveTab(routeToTab[pathname] || null);
  }, [pathname, routeToTab]);

  const handleNavigation = useCallback((path, label) => {
    setActiveTab(label);
    router.push(path);
  }, [router]);

  const handleLogout = useCallback(() => {
    if (keycloak?.authenticated)
      keycloak.logout({ redirectUri: window.location.origin });
    else
      router.push("/");
  }, [keycloak, router]);

  const handleHomeClick = useCallback(() => {
    const path =
      filteredPublicModules[0]?.path ||
      filteredAdminModules[0]?.path ||
      "/documentchat";

    router.push(path);
    setActiveTab(null);
  }, [filteredPublicModules, filteredAdminModules, router]);

  const publicMenuSection = useMemo(() => {
    if (filteredPublicModules.length === 0) return null;

    return (
      <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
        {filteredPublicModules.map(module => {
          const handler = getStable(`nav-${module.id}`, () =>
            handleNavigation(module.path, module.label)
          );
          return (
            <MenuButton
              key={module.id}
              text={module.label}
              image={module.icon}
              isActive={activeTab === module.label}
              onClick={handler}
            />
          );
        })}
      </div>
    );
  }, [filteredPublicModules, activeTab, handleNavigation, getStable]);

  const adminMenuSection = useMemo(() => {
    if (filteredAdminModules.length === 0) return null;

    return (
      <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
        {filteredAdminModules.map(module => {
          const handler = getStable(`nav-${module.id}`, () =>
            handleNavigation(module.path, module.label)
          );
          return (
            <MenuButton
              key={module.id}
              text={module.label}
              image={module.icon}
              isActive={activeTab === module.label}
              onClick={handler}
            />
          );
        })}
      </div>
    );
  }, [filteredAdminModules, activeTab, handleNavigation, getStable]);

  const logoutButton = useMemo(() => {
    const handler = getStable("logout", handleLogout);
    return (
      <MenuButton
        text="Afmelden"
        image={logoutItem}
        isActive={false}
        onClick={handler}
      />
    );
  }, [handleLogout, getStable]);

  if (!initialized || loading) {
    return (
      <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
        <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <div className="font-extrabold text-[40px] leading-none font-montserrat text-[#23BD92]">
            DAVI
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#23BD92]"></div>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginHandler = getStable("login", () => router.push("/"));
    return (
      <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
        <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <div className="font-extrabold text-[40px] leading-none text-[#23BD92]">
            DAVI
          </div>
          <div className="text-gray-500 text-sm text-center">Please log in</div>
        </div>
        <div className="w-full pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <MenuButton text="Login" image={logoutItem} isActive={false} onClick={loginHandler} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
      <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        <div
          className="font-extrabold text-[40px] leading-none text-[#23BD92] cursor-pointer"
          onClick={handleHomeClick}
        >
          DAVI
        </div>

        <div className="flex flex-col gap-6">
          {publicMenuSection}

          {filteredPublicModules.length > 0 &&
            filteredAdminModules.length > 0 && (
              <div className="w-full h-px bg-[#C5BEBE]"></div>
            )}

          {adminMenuSection}

          {filteredPublicModules.length === 0 &&
            filteredAdminModules.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4 border rounded bg-gray-50">
                No modules available.
              </div>
            )}
        </div>
      </div>

      <div className="w-full pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        {logoutButton}
      </div>
    </div>
  );
}
