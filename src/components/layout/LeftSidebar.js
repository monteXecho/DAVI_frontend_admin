"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useUser } from "@/lib/context/UserContext";

import logoutItem from "@/assets/Vector.png";
import MenuButton from "@/components/buttons/MenuButton";

import ChatItem from "@/assets/chat_item.png";
import VGCItem from "@/assets/VGC_item.png";
import RollenItem from "@/assets/rollen_item.png";
import GebruikersItem from "@/assets/gebruikers_item.png";
import DocumentenItem from "@/assets/documenten_item.png";
import CompanyItem from "@/assets/company_item.png";
import GrayFolderIcon from "@/components/icons/GrayFolderIcon";

const MENU_CONFIG = {
  publicModules: [
    {
      id: "documentenchat",
      label: "Documentenchat",
      icon: ChatItem,
      path: "/documentchat",
      moduleKey: "Documenten chat",
    },
    {
      id: "ggd-checks",
      label: "GGD Checks",
      icon: VGCItem,
      path: "/GGD",
      moduleKey: "GGD Checks",
    },
  ],
  adminModules: [
    {
      id: "companies",
      label: "Compagnies",
      icon: CompanyItem,
      path: "/compagnies",
      requiredRole: "super_admin",
    },
    {
      id: "roles",
      label: "Rollen",
      icon: RollenItem,
      path: "/rollen",
      requiredRoles: ["super_admin", "company_admin"],
    },
    {
      id: "users",
      label: "Gebruikers",
      icon: GebruikersItem,
      path: "/gebruikers",
      requiredRoles: ["super_admin", "company_admin"],
    },
    {
      id: "documents",
      label: "Documenten",
      icon: DocumentenItem,
      path: "/documenten",
      requiredRoles: ["super_admin", "company_admin"],
    },
    {
      id: "mappen",
      label: "Mappen",
      icon: GrayFolderIcon,
      path: "/mappen",
      requiredRoles: ["super_admin", "company_admin"],
    },
  ],
};

export default function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const userCtx = useUser();
  if (!userCtx) return null;

  const { user, roles, loading, isAuthenticated, logout } = userCtx;

  const [activeTab, setActiveTab] = useState(null);

  // ------------------------------------------------------------
  // MODULE FILTERING
  // ------------------------------------------------------------
  const { filteredPublicModules, filteredAdminModules } = useMemo(() => {
    if (!user) return { filteredPublicModules: [], filteredAdminModules: [] };

    const publicModules = roles.isSuperAdmin
      ? MENU_CONFIG.publicModules
      : MENU_CONFIG.publicModules.filter((mod) => {
          return user?.modules?.[mod.moduleKey]?.enabled === true;
        });

    const adminModules = roles.isSuperAdmin
      ? MENU_CONFIG.adminModules
      : MENU_CONFIG.adminModules.filter((mod) => {
          if (mod.requiredRole === "super_admin") {
            return roles.isSuperAdmin;
          }
          if (mod.requiredRoles) {
            return mod.requiredRoles.some((role) => {
              return (
                (role === "super_admin" && roles.isSuperAdmin) ||
                (role === "company_admin" && roles.isCompanyAdmin)
              );
            });
          }
          return true;
        });

    return { filteredPublicModules: publicModules, filteredAdminModules: adminModules };
  }, [user, roles]);

  // ------------------------------------------------------------
  // FIX: REDIRECT "/" SAFELY IN useEffect
  // ------------------------------------------------------------
  useEffect(() => {
    if (loading || !isAuthenticated) return;

    // prevent running multiple times with same pathname
    if (pathname !== "/") return;

    if (!filteredPublicModules.length && !filteredAdminModules.length) return;

    const defaultRoute =
      filteredPublicModules[0]?.path ||
      filteredAdminModules[0]?.path ||
      "/documentchat";

    // Defer to next tick to avoid "update during render"
    setTimeout(() => {
      router.push(defaultRoute);
    }, 0);
  }, [
    pathname,
    loading,
    isAuthenticated,
    filteredPublicModules,
    filteredAdminModules,
    router,
  ]);

  // ------------------------------------------------------------
  // NAVIGATION HANDLERS
  // ------------------------------------------------------------
  const handleNavigation = useCallback(
    (path, label) => {
      setActiveTab(label);
      router.push(path);
    },
    [router]
  );

  const handleHomeClick = useCallback(() => {
    const path =
      filteredPublicModules[0]?.path ||
      filteredAdminModules[0]?.path ||
      "/documentchat";

    router.push(path);
    setActiveTab(null);
  }, [filteredPublicModules, filteredAdminModules, router]);

  // ------------------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------------------
  if (loading) {
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

  // ------------------------------------------------------------
  // NOT AUTHENTICATED
  // ------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
        <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
          <div className="font-extrabold text-[40px] leading-none text-[#23BD92]">
            DAVI
          </div>
          <div className="text-gray-500 text-sm text-center">Please log in</div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // RENDER UI
  // ------------------------------------------------------------
  return (
    <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
      {/* TOP */}
      <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        <div
          className="font-extrabold text-[40px] leading-none text-[#23BD92] cursor-pointer"
          onClick={handleHomeClick}
        >
          DAVI
        </div>

        <div className="flex flex-col gap-6">
          {/* Public Modules */}
          {filteredPublicModules.length > 0 && (
            <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
              {filteredPublicModules.map((module) => (
                <MenuButton
                  key={module.id}
                  text={module.label}
                  image={module.icon}
                  isActive={activeTab === module.label}
                  onClick={() => handleNavigation(module.path, module.label)}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          {filteredPublicModules.length > 0 && filteredAdminModules.length > 0 && (
            <div className="w-full h-px bg-[#C5BEBE]"></div>
          )}

          {/* Admin Modules */}
          {filteredAdminModules.length > 0 && (
            <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
              {filteredAdminModules.map((module) => (
                <MenuButton
                  key={module.id}
                  text={module.label}
                  image={module.icon}
                  isActive={activeTab === module.label}
                  onClick={() => handleNavigation(module.path, module.label)}
                />
              ))}
            </div>
          )}

          {/* No Modules */}
          {filteredPublicModules.length === 0 &&
            filteredAdminModules.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4 border rounded bg-gray-50">
                No modules available.
              </div>
            )}
        </div>
      </div>

      {/* LOGOUT */}
      <div className="w-full pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        <MenuButton text="Afmelden" image={logoutItem} onClick={logout} />
      </div>
    </div>
  );
}
