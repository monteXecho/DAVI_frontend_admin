'use client';
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useKeycloak } from "@react-keycloak/web";
import { useApi } from "@/lib/useApi";
import Image from "next/image";
import LogoImage from "@/assets/login-side.png";

export default function UserSwitchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { keycloak, initialized } = useKeycloak();
  const { getGuestWorkspaces, getUser } = useApi();

  const [options, setOptions] = useState([]);
  const [userMeta, setUserMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const redirectTo = useMemo(
    () => searchParams?.get("redirect") || "/",
    [searchParams]
  );

  useEffect(() => {
    if (!initialized || !keycloak?.authenticated) return;

    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    const isSuperAdmin = roles.includes("super_admin");

    if (isSuperAdmin) {
      // Super admins do not need to pick a workspace; take them back immediately
      setLoading(false);
      router.replace(redirectTo);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [user, workspaces] = await Promise.all([
          getUser(),
          getGuestWorkspaces(),
        ]);

        setUserMeta(user);

        const normalized = [];
        if (workspaces?.self) {
          normalized.push({
            ownerId: workspaces.self.ownerId,
            label: workspaces.self.label || "Mijn werkruimte",
            permissions: null,
            badge: user?.is_teamlid ? "Eigen" : "Standaard",
          });
        }

        (workspaces?.guestOf || []).forEach((ws) => {
          normalized.push({
            ownerId: ws.ownerId,
            label: ws.label,
            permissions: ws.permissions,
            owner: ws.owner,
            badge: "Gast",
          });
        });

        setOptions(normalized);
      } catch (err) {
        console.error("[userswitch] failed to load data:", err);
        setError("Kan rollen niet ophalen. Probeer opnieuw.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [initialized, keycloak?.authenticated, getUser, getGuestWorkspaces, router, redirectTo]);

  const handleRoleSelect = (option) => {
    try {
      window.localStorage.setItem("daviActingOwnerId", option.ownerId);
      window.localStorage.setItem("daviActingOwnerLabel", option.label || "");
      if (userMeta?.user_id) {
        window.localStorage.setItem("daviActingOwnerUserId", String(userMeta.user_id));
      }
      window.sessionStorage.setItem("daviActingOwnerSelectedForSession", "true");
    } catch (e) {
      // ignore storage issues
    }

    router.replace(redirectTo);
  };

  const handleLogout = () => {
    if (keycloak?.authenticated) {
      keycloak.logout({ redirectUri: window.location.origin });
    } else {
      router.replace("/");
    }
  };

  const headline = userMeta?.is_teamlid
    ? "Kies hoe je wilt werken"
    : "Selecteer een werkruimte";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-[#F5FBF8] via-white to-[#E8F5EE] px-6 py-10">
      <div className="absolute top-0 right-0 overflow-hidden">
        <Image
          src={LogoImage}
          alt="Logo"
          className="w-[360px] h-[360px] object-cover rounded-full opacity-70 translate-x-16 -translate-y-12"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/90 backdrop-blur border border-[#E5F3EC] shadow-xl px-10 py-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-extrabold text-[#23BD92] leading-none">
              DAVI
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-800">
              {headline}
            </div>
            {userMeta?.assigned_teamlid_by_name && (
              <div className="mt-2 text-sm text-amber-700">
                Toegevoegd als teamlid door {userMeta.assigned_teamlid_by_name}
              </div>
            )}
            {userMeta?.teamlid_permissions && (
              <div className="mt-1 text-xs text-slate-600">
                Permissies:{" "}
                {Object.entries(userMeta.teamlid_permissions || {})
                  .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val ? "aan" : "uit"}`)
                  .join(" · ")}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors"
          >
            <svg width="20" height="18" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7V3L24 10L16 17V13H8V7H16ZM14 17V16.917C12.822 17.602 11.458 18 10 18C5.589 18 2 14.411 2 10C2 5.589 5.589 2 10 2C11.458 2 12.822 2.398 14 3.083V0.838C12.774 0.302 11.423 0 10 0C4.478 0 0 4.477 0 10C0 15.523 4.478 20 10 20C11.423 20 12.774 19.698 14 19.162V17Z" fill="#6B7280" />
            </svg>
            Afmelden
          </button>
        </div>

        <div className="mt-10">
          {loading && (
            <div className="flex items-center gap-3 text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#23BD92]" />
              Gegevens laden...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {options.map((option) => (
                <RoleCard
                  key={option.ownerId}
                  option={option}
                  onClick={() => handleRoleSelect(option)}
                />
              ))}

              {options.length === 0 && (
                <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  Geen werkruimtes gevonden. Vraag een beheerder om toegang.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleCard({ option, onClick }) {
  const { label, badge, permissions, owner } = option;

  return (
    <button
      onClick={onClick}
      className="group relative flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F6F0] text-[#23BD92] font-semibold">
          {label?.slice(0, 2)?.toUpperCase() || "WS"}
        </div>
        {badge && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 text-lg font-semibold text-slate-900 leading-tight">
        {label}
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-600">
        {permissions ? (
          <>
            <PermissionLine label="Rollen" value={permissions.role_write ? "Schrijven" : "Lezen"} />
            <PermissionLine label="Gebruikers" value={permissions.user_read ? "Lezen" : "Geen toegang"} />
            <PermissionLine label="Documenten" value={permissions.document_read ? "Lezen" : "Geen toegang"} />
            <PermissionLine label="Mappen" value={permissions.folder_write ? "Schrijven" : "Lezen"} />
          </>
        ) : (
          <div className="text-slate-500">Volledige toegang tot eigen workspace.</div>
        )}
      </div>

      {badge === "Gast" && owner && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Beheerder</div>
          {owner.name && <div>{owner.name}</div>}
          {owner.email && <div className="text-slate-500 text-xs">{owner.email}</div>}
        </div>
      )}

      <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#23BD92]">
        Kies deze rol
        <svg
          className="ml-2 transition-transform group-hover:translate-x-1"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 8H12.5"
            stroke="#23BD92"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 4.5L12.5 8L9 11.5"
            stroke="#23BD92"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

function PermissionLine({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
