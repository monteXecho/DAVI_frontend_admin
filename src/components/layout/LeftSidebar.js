'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useKeycloak } from "@react-keycloak/web";
import { useApi } from "@/lib/useApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";

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
  const { workspaces, selectedOwnerId } = useWorkspace();

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

    // Super admins don't need profile data for workspace routing; skip fetch
    if (userRoles.isSuperAdmin) {
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
  }, [isAuthenticated, getUser, userRoles.isSuperAdmin]);

  useEffect(() => {
    if (!user) return;

    let storedOwnerId = null;
    let storedOwnerUserId = null;
    let sessionChoiceMade = false;
    if (typeof window !== "undefined") {
      try {
        storedOwnerId = window.localStorage.getItem("daviActingOwnerId");
        storedOwnerUserId = window.localStorage.getItem("daviActingOwnerUserId");
        sessionChoiceMade = window.sessionStorage.getItem("daviActingOwnerSelectedForSession") === "true";
      } catch (e) {
        // ignore storage issues
      }
    }

    // Teamlid must pick a workspace/role first; allow through once a choice exists and was selected this session
    // Super admins should never be forced into user switch
    if (user.is_teamlid && !userRoles.isSuperAdmin) {
      const ownerBelongsToThisUser =
        storedOwnerUserId && String(storedOwnerUserId) === String(user.user_id);

      if (!storedOwnerId || !ownerBelongsToThisUser || !sessionChoiceMade) {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem("daviActingOwnerId");
            window.localStorage.removeItem("daviActingOwnerLabel");
            window.localStorage.removeItem("daviActingOwnerUserId");
            window.sessionStorage.removeItem("daviActingOwnerSelectedForSession");
          } catch (e) {
            // ignore storage issues
          }
        }
        if (pathname !== "/userswitch") {
          const redirect = encodeURIComponent(pathname || "/");
          router.replace(`/userswitch?redirect=${redirect}`);
        }
        return;
      }
    }

    // Ensure default acting owner id is persisted for normal users
    if (!user.is_teamlid && typeof window !== "undefined") {
      try {
        if (!storedOwnerId && user.user_id) {
          window.localStorage.setItem("daviActingOwnerId", user.user_id);
        }
      } catch (e) {
        // storage unavailable; ignore
      }
    }
  }, [user, pathname, router, userRoles.isSuperAdmin]);

  const stableUser = userRef.current;  

  // Check if company user has teamlid permissions (from workspaces)
  // Only return true when actually acting on a guest workspace, not just because they have one available
  const hasTeamlidAccess = useMemo(() => {
    if (userRoles.isSuperAdmin || userRoles.isCompanyAdmin) return true;
    if (!userRoles.isCompanyUser) return false;
    
    if (!selectedOwnerId || !workspaces) return false;
    
    // For company users, check if they're acting on a guest workspace
    // Case 1: selectedOwnerId is different from self.ownerId - definitely a guest workspace
    if (workspaces.self?.ownerId !== selectedOwnerId) {
      const isGuestWorkspace = workspaces?.guestOf?.some(ws => ws.ownerId === selectedOwnerId);
      return isGuestWorkspace || false;
    }
    
    // Case 2: selectedOwnerId matches self.ownerId - could be self OR guest with same ownerId
    // Check the isGuest flag from localStorage to distinguish
    if (typeof window !== 'undefined') {
      try {
        const isGuest = window.localStorage.getItem('daviActingOwnerIsGuest') === 'true';
        if (isGuest) {
          // Check if there's actually a guest workspace with this ownerId
          const hasGuestWorkspace = workspaces?.guestOf?.some(ws => ws.ownerId === selectedOwnerId);
          return hasGuestWorkspace || false;
        }
      } catch (e) {
        // ignore storage errors
      }
    }
    
    // If selectedOwnerId matches self.ownerId and isGuest flag is not set, it's the self workspace
    return false;
  }, [userRoles, workspaces, selectedOwnerId]);

  const { filteredPublicModules, filteredAdminModules } = useMemo(() => {
    // For public modules (Document Chat, GGD Checks):
    // Always use the user's own modules, not guest workspace modules
    // This ensures company admins acting as teamlid still see their own modules
    const publicModules = userRoles.isSuperAdmin
      ? MENU_CONFIG.publicModules
      : MENU_CONFIG.publicModules.filter(module => {
          // Always check against the user's own modules, regardless of guest mode
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
                ? (userRoles.isCompanyAdmin || hasTeamlidAccess)  // Allow company users with teamlid access
                : false
            );
          return true;
        });

    return { filteredPublicModules: publicModules, filteredAdminModules: adminModules };
  }, [stableUser, userRoles, isAuthenticated, hasTeamlidAccess]);

  const routeToTab = useMemo(() => {
    const map = {
      "/documentchat": "Documentenchat",
      "/documentchat/mijn": "Documentenchat",
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
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
    } catch (e) {
      // ignore storage errors on logout
    }

    if (keycloak?.authenticated) {
      keycloak.logout({ redirectUri: window.location.origin });
    } else {
      router.push("/");
    }
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
      <div className="flex flex-col h-screen w-[320px] max-w-[360px] bg-white border-r border-slate-200 shadow-sm">
        <div className="px-8 pt-10 pb-6 border-b border-slate-200">
          <div className="font-extrabold text-3xl leading-none font-montserrat text-[#23BD92]">
            DAVI
          </div>
          <div className="mt-3 flex items-center gap-2 text-gray-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#23BD92]"></div>
            Laden...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginHandler = getStable("login", () => router.push("/"));
    return (
      <div className="flex flex-col h-screen w-[320px] max-w-[360px] bg-white border-r border-slate-200 shadow-sm">
        <div className="px-8 pt-10 pb-6 border-b border-slate-200">
          <div className="font-extrabold text-3xl leading-none text-[#23BD92]">
            DAVI
          </div>
          <div className="mt-2 text-gray-500 text-sm">Log in om verder te gaan</div>
        </div>
        <div className="px-8 py-6">
          <MenuButton text="Login" image={logoutItem} isActive={false} onClick={loginHandler} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-[320px] max-w-[360px] bg-white border-r border-slate-200 shadow-sm">
      <div className="px-8 pt-10 pb-6 border-b border-slate-200">
        <div
          className="font-extrabold text-3xl leading-none text-[#23BD92] cursor-pointer"
          onClick={handleHomeClick}
        >
          DAVI
        </div>
        {user?.name || user?.email ? (
          <div className="mt-2 text-xs text-gray-500">
            {user?.name || user?.email}
          </div>
        ) : null}
        {(() => {
          // Determine current role state based on selected workspace
          if (!workspaces || !selectedOwnerId || !user) return null;
          
          const isDefaultRole = workspaces.self?.ownerId === selectedOwnerId;
          
          if (isDefaultRole) {
            // User is acting on their own workspace (default role)
            return (
              <div className="mt-1 text-[11px] text-gray-600">
                Standaard rol
              </div>
            );
          } else {
            // User is acting as a teamlid (guest mode)
            const guestWorkspace = (workspaces.guestOf || []).find(
              (ws) => ws.ownerId === selectedOwnerId
            );
            if (guestWorkspace?.owner) {
              const adminName = guestWorkspace.owner.name || guestWorkspace.owner.email || 'beheerder';
              return (
                <div className="mt-1 text-[11px] text-amber-600">
                  Teamlid voor {adminName}
                </div>
              );
            }
          }
          return null;
        })()}
        
        {/* Workspace/Role Switcher - Only shows for users with multiple roles */}
        <div className="mt-4">
          <WorkspaceSwitcher />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 space-y-8">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.12em] text-gray-500 font-semibold">
            Modules
          </div>
          {publicMenuSection}
        </div>

        {filteredPublicModules.length > 0 && filteredAdminModules.length > 0 && (
          <div className="h-px bg-slate-200" />
        )}

        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.12em] text-gray-500 font-semibold">
            Beheer
          </div>
          {adminMenuSection}
        </div>

        {filteredPublicModules.length === 0 &&
          filteredAdminModules.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4 border rounded bg-gray-50">
              Geen modules beschikbaar.
            </div>
          )}
      </div>

      <div className="px-6 py-6 border-t border-slate-200">
        {logoutButton}
      </div>
    </div>
  );
}
