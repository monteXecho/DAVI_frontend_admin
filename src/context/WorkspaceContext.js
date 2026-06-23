'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useKeycloak } from '@react-keycloak/web';
import { apiClient, createAuthHeaders } from '@/lib/apiClient';

export const WorkspaceContext = createContext(null);

const LS_COMPANY = 'daviSelectedCompanyId';

/** Normalize GET /guest-workspaces JSON to a uniform list keyed by organisation. */
export function normalizeWorkspaceCompanies(data) {
  if (!data) return [];

  const fromArray =
    Array.isArray(data.companies) &&
    data.companies.map((b) => ({
      companyId: String(b.company_id ?? '').trim(),
      companyName: (b.company_name && String(b.company_name)) || '',
      memberUserId: b.member_user_id != null ? String(b.member_user_id) : '',
      memberIsTeamlid: Boolean(b.member_is_teamlid),
      memberTeamlidOnly: Boolean(b.member_teamlid_only),
      membershipKind: b.membership_kind || '',
      self: b.self ?? null,
      guestOf: Array.isArray(b.guestOf) ? b.guestOf : [],
    }));

  if (fromArray && fromArray.length > 0) {
    return fromArray;
  }

  const self = data.self ?? null;
  const guestOf = Array.isArray(data.guestOf) ? data.guestOf : [];
  return [
    {
      companyId: '',
      companyName: '',
      memberUserId: '',
      memberIsTeamlid: false,
      memberTeamlidOnly: false,
      membershipKind: '',
      self,
      guestOf,
    },
  ];
}

/** Whether (ownerId + teamlid flag) matches this organisation block */
function workspaceBlockMatches(block, ownerId, isGuest) {
  if (!ownerId || !block) return false;
  const selfOid = block.self?.ownerId;
  const guests = block.guestOf || [];
  if (!isGuest) {
    return selfOid === ownerId;
  }
  return guests.some((g) => g.ownerId === ownerId);
}

function readActingPrefs() {
  if (typeof window === 'undefined') return { ownerId: null, isGuest: false };
  try {
    const ownerId = window.localStorage.getItem('daviActingOwnerId');
    const isGuest = window.localStorage.getItem('daviActingOwnerIsGuest') === 'true';
    return { ownerId, isGuest };
  } catch (_) {
    return { ownerId: null, isGuest: false };
  }
}

function companyIdMatchesStored(c, storedTrim) {
  if (!storedTrim) return false;
  return String(c.companyId ?? '').trim() === storedTrim;
}

function pickCompanyForMemberships(companies) {
  if (!companies.length) return '';

  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(LS_COMPANY) : null;
    const storedTrim = stored && String(stored).trim();

    if (storedTrim && companies.some((c) => companyIdMatchesStored(c, storedTrim))) {
      return storedTrim;
    }

    const { ownerId, isGuest } = readActingPrefs();
    const matches = companies.filter((c) =>
      workspaceBlockMatches(c, ownerId, isGuest)
    );

    if (matches.length === 1) return matches[0].companyId || '';

    if (companies.length === 1) {
      const only = companies[0];
      return only.companyId || '';
    }

    return null;
  } catch (_) {
    return companies.length === 1 ? companies[0].companyId || '' : null;
  }
}

export function workspacesFromCompanyBlock(block) {
  if (!block) return { self: null, guestOf: [] };
  return {
    self: block.self,
    guestOf: block.guestOf || [],
  };
}

/**
 * API headers read acting prefs from localStorage. If the stored owner/guest pair
 * does not belong to the active organisation block, fix LS before any child useEffect
 * runs getUser() (avoids 403 when company header and acting owner are out of sync).
 * @returns {string|null} canonical owner id written to LS
 */
export function repairActingPrefsForActiveCompanyBlock(block) {
  if (typeof window === 'undefined' || !block) return null;
  try {
    const rawOwner = window.localStorage.getItem('daviActingOwnerId');
    const ownerId = rawOwner && String(rawOwner).trim();
    const isGuest = window.localStorage.getItem('daviActingOwnerIsGuest') === 'true';

    const matches = Boolean(ownerId && workspaceBlockMatches(block, ownerId, isGuest));

    if (matches) {
      if (block.memberUserId) {
        window.localStorage.setItem('daviActingOwnerUserId', String(block.memberUserId));
      }
      return ownerId;
    }

    const selfOwner = block.memberTeamlidOnly ? null : block.self?.ownerId;
    if (selfOwner) {
      window.localStorage.setItem('daviActingOwnerId', selfOwner);
      window.localStorage.setItem('daviActingOwnerIsGuest', 'false');
      if (block.memberUserId) {
        window.localStorage.setItem('daviActingOwnerUserId', String(block.memberUserId));
      }
      return selfOwner;
    }

    const firstGuest = (block.guestOf || []).find((g) => g?.ownerId);
    if (firstGuest?.ownerId) {
      window.localStorage.setItem('daviActingOwnerId', firstGuest.ownerId);
      window.localStorage.setItem('daviActingOwnerIsGuest', 'true');
      if (block.memberUserId) {
        window.localStorage.setItem('daviActingOwnerUserId', String(block.memberUserId));
      }
      if (block.memberTeamlidOnly) {
        window.sessionStorage.setItem('daviActingOwnerSelectedForSession', 'true');
      }
      return firstGuest.ownerId;
    }
    return null;
  } catch (_) {
    return null;
  }
}

/** Clear persisted workspace / organisation selection (userswitch picks again). */
export function clearWorkspaceLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('daviActingOwnerId');
    window.localStorage.removeItem('daviActingOwnerIsGuest');
    window.localStorage.removeItem('daviActingOwnerLabel');
    window.localStorage.removeItem('daviActingOwnerUserId');
    window.localStorage.removeItem(LS_COMPANY);
    window.sessionStorage.removeItem('daviActingOwnerSelectedForSession');
  } catch (_) {
    /* ignore */
  }
}

export function WorkspaceProvider({ children }) {
  const { keycloak } = useKeycloak();
  const pathname = usePathname();
  const router = useRouter();

  /** Full payload: one row per Mongo company_membership */
  const [workspaceCompanies, setWorkspaceCompanies] = useState([]);

  /** Active block for menus / acting-owner UX (narrow view) */
  const [workspaces, setWorkspaces] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [permissions, setPermissions] = useState(null);

  /**
   * Reactive mirror of ``localStorage.daviActingOwnerIsGuest``. Needed when
   * ``workspaces.self.ownerId === workspaces.guestOf[0].ownerId`` (the typical company_user case:
   * ``added_by_admin_id`` == workspace_owner). In that scenario toggling between MIJN WERKRUIMTE and
   * WERKRUIMTE VAN ... never changes ``selectedOwnerId``, so without this state the ``permissions``
   * and ``ownerModules`` derivations would never re-run and BEHEER stays empty in teamlid mode.
   */
  const [isGuestMode, setIsGuestMode] = useState(false);

  /** Block child layout until organisations are resolved (avoids getUser without X-Selected-Company-Id). */
  const [workspaceBootstrapped, setWorkspaceBootstrapped] = useState(false);

  const readGuestModeFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('daviActingOwnerIsGuest') === 'true';
    } catch (_) {
      return false;
    }
  }, []);

  const syncGuestModeFromStorage = useCallback(() => {
    setIsGuestMode((prev) => {
      const next = readGuestModeFromStorage();
      return prev === next ? prev : next;
    });
  }, [readGuestModeFromStorage]);

  const ownerModules = useMemo(() => {
    if (!workspaces || !selectedOwnerId) return null;
    if (workspaces.self && workspaces.self.ownerId === selectedOwnerId) {
      if (isGuestMode) {
        const g = (workspaces.guestOf || []).find((ws) => ws.ownerId === selectedOwnerId);
        return g?.owner_modules ?? null;
      }
      return null;
    }
    const guest = (workspaces.guestOf || []).find((ws) => ws.ownerId === selectedOwnerId);
    return guest?.owner_modules ?? null;
  }, [workspaces, selectedOwnerId, isGuestMode]);

  useEffect(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    const isSuperAdmin = roles.includes('super_admin');

    const run = async () => {
      if (!keycloak?.authenticated) {
        /**
         * Keep ``workspaceBootstrapped = false`` while KC has not finished initialising.
         * Setting it ``true`` here optimistically would allow LeftSidebar/Footer effects
         * to fire ``getUser`` on the same tick KC flips authenticated → true, before this
         * parent effect can commit the reset, producing a 400 on multi-org accounts.
         */
        setWorkspaceCompanies([]);
        setWorkspaces(null);
        setWorkspaceBootstrapped(false);
        return;
      }

      if (isSuperAdmin) {
        setWorkspaceCompanies([]);
        setWorkspaces(null);
        setSelectedOwnerId(null);
        setWorkspaceBootstrapped(true);
        return;
      }

      setWorkspaceBootstrapped(false);

      const token = keycloak.token;
      if (!token) {
        /** Token arrives shortly after authenticated flips true; stay not bootstrapped so no child hits /company-admin/user without ``X-Selected-Company-Id``. */
        return;
      }

      try {
        const res = await apiClient.get(
          '/company-admin/guest-workspaces',
          createAuthHeaders(token)
        );

        const companies = normalizeWorkspaceCompanies(res.data);

        let companyKey = pickCompanyForMemberships(companies);

        if (companies.length > 1 && (companyKey === null || companyKey === '')) {
          /**
           * Multi-org email with no chosen company yet: send the user to /userswitch and KEEP
           * ``workspaceBootstrapped = false`` so children (LeftSidebar, Footer, WorkspaceSwitcher)
           * cannot fire ``getUser`` without ``X-Selected-Company-Id`` (would be a 400 on first login).
           * The /userswitch page is rendered via the ``pathname === '/userswitch'`` exemption in
           * ``showBootstrapWait`` below.
           */
          clearWorkspaceLocalStorage();
          setWorkspaceCompanies(companies);
          setWorkspaces(null);
          setSelectedCompanyId('');
          if (pathname !== '/userswitch') {
            const redirect = pathname ? encodeURIComponent(pathname) : '';
            const dest = redirect ? `/userswitch?redirect=${redirect}` : '/userswitch';
            router.replace(dest);
          }
          return;
        }

        if (companyKey === null || companyKey === '') {
          companyKey = companies.length === 1 ? companies[0].companyId || '' : '';
        }

        try {
          if (typeof window !== 'undefined' && companyKey) {
            window.localStorage.setItem(LS_COMPANY, companyKey);
          }
        } catch (_) {
          /* ignore */
        }

        const keyTrim = String(companyKey || '').trim();
        const active =
          companies.find((c) => companyIdMatchesStored(c, keyTrim)) ?? companies[0];

        const narrow = workspacesFromCompanyBlock(active);
        const repairedOwner = repairActingPrefsForActiveCompanyBlock(active);

        setWorkspaceCompanies(companies);
        setSelectedCompanyId(active?.companyId || companyKey || '');
        setWorkspaces(narrow);
        if (repairedOwner) {
          setSelectedOwnerId(repairedOwner);
        }
        /** ``repairActingPrefsForActiveCompanyBlock`` may have written ``daviActingOwnerIsGuest`` (e.g. flipped to "false" while defaulting to self); sync the reactive copy so ``permissions`` / ``ownerModules`` match. */
        syncGuestModeFromStorage();
        setWorkspaceBootstrapped(true);
      } catch (err) {
        console.error('[WorkspaceProvider] Failed to fetch workspaces:', err);
        setWorkspaceCompanies([]);
        setWorkspaces(null);
        setWorkspaceBootstrapped(true);
      }
    };

    run();
     
  }, [
    keycloak?.authenticated,
    keycloak?.tokenParsed?.sub,
    keycloak?.token,
    pathname,
    router,
    syncGuestModeFromStorage,
  ]);

  /** After client-side userswitch / workspace events: re-slice narrow + repair LS (no refetch). */
  const reapplyWorkspaceSelection = useCallback(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (!keycloak?.authenticated || roles.includes('super_admin')) return;
    if (!workspaceCompanies.length) return;

    let companyKey = pickCompanyForMemberships(workspaceCompanies);
    if (companyKey === null || companyKey === '') {
      companyKey =
        workspaceCompanies.length === 1 ? workspaceCompanies[0].companyId || '' : '';
    }

    const keyTrim = String(companyKey || '').trim();
    const active =
      workspaceCompanies.find((c) => companyIdMatchesStored(c, keyTrim)) ??
      workspaceCompanies[0];
    if (!active) return;

    const narrow = workspacesFromCompanyBlock(active);
    const repairedOwner = repairActingPrefsForActiveCompanyBlock(active);

    setSelectedCompanyId(active.companyId || companyKey || '');
    setWorkspaces(narrow);
    if (repairedOwner) {
      setSelectedOwnerId(repairedOwner);
    }
    /** ``daviActingOwnerIsGuest`` may have flipped (self↔guest with identical ownerId); re-derive. */
    syncGuestModeFromStorage();
    /** Multi-org user just picked a workspace via /userswitch (or WorkspaceSwitcher); now safe to bootstrap. */
    setWorkspaceBootstrapped(true);
  }, [workspaceCompanies, keycloak?.authenticated, keycloak?.tokenParsed, syncGuestModeFromStorage]);

  const syncWithLocalStorage = useCallback(() => {
    if (!workspaces) return;

    const optionIds = [
      workspaces.self?.ownerId,
      ...(workspaces.guestOf || []).map((ws) => ws.ownerId),
    ].filter(Boolean);

    if (!optionIds.length) return;

    let stored = null;
    if (typeof window !== 'undefined') {
      try {
        stored = window.localStorage.getItem('daviActingOwnerId');
      } catch (e) {
        // ignore storage read errors
      }
    }

    const nextOwnerId = optionIds.includes(stored)
      ? stored
      : workspaces.self?.ownerId || optionIds[0];

    if (nextOwnerId && nextOwnerId !== selectedOwnerId) {
      setSelectedOwnerId(nextOwnerId);
    }
  }, [workspaces, selectedOwnerId]);

  useEffect(() => {
    syncWithLocalStorage();
     
  }, [syncWithLocalStorage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /** Pick up an LS value persisted by a previous session (set before the provider mounted). */
    syncGuestModeFromStorage();

    const handleStorageChange = (e) => {
      if (e.key === LS_COMPANY) {
        reapplyWorkspaceSelection();
      } else if (e.key === 'daviActingOwnerId') {
        syncWithLocalStorage();
      } else if (e.key === 'daviActingOwnerIsGuest') {
        syncGuestModeFromStorage();
      }
    };

    const handleWorkspaceChange = () => {
      /** /userswitch handleRoleSelect writes ``daviActingOwnerIsGuest`` then dispatches this event. */
      syncGuestModeFromStorage();
      reapplyWorkspaceSelection();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('daviWorkspaceChange', handleWorkspaceChange);
    window.addEventListener('daviCompanyChange', handleWorkspaceChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('daviWorkspaceChange', handleWorkspaceChange);
      window.removeEventListener('daviCompanyChange', handleWorkspaceChange);
    };
  }, [reapplyWorkspaceSelection, syncWithLocalStorage, syncGuestModeFromStorage]);

  useEffect(() => {
    if (!selectedOwnerId || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('daviActingOwnerId', selectedOwnerId);
      window.sessionStorage.setItem('daviActingOwnerSelectedForSession', 'true');
    } catch (e) {
      // ignore storage write errors
    }
  }, [selectedOwnerId]);

  useEffect(() => {
    if (!workspaces || !selectedOwnerId) {
      setPermissions(null);
      return;
    }

    if (workspaces.self && workspaces.self.ownerId === selectedOwnerId) {
      if (isGuestMode) {
        const guestWithSameOwner = (workspaces.guestOf || []).find(
          (ws) => ws.ownerId === selectedOwnerId
        );
        setPermissions(guestWithSameOwner?.permissions || null);
      } else {
        setPermissions(workspaces.self.permissions || null);
      }
      return;
    }

    const guest = (workspaces.guestOf || []).find((ws) => ws.ownerId === selectedOwnerId);
    if (guest) {
      setPermissions(guest.permissions || null);
    } else {
      setPermissions(null);
    }
  }, [workspaces, selectedOwnerId, isGuestMode]);

  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const isSuperAdmin = roles.includes('super_admin');

  /**
   * Show ``Werkruimtes laden...`` while bootstrap is pending. ``/userswitch`` is exempt so the
   * workspace picker can render even when a multi-org email has not chosen a company yet
   * (we keep ``workspaceBootstrapped`` false in that path to block child ``getUser`` calls).
   */
  const showBootstrapWait = Boolean(
    keycloak?.authenticated &&
      !isSuperAdmin &&
      !workspaceBootstrapped &&
      pathname !== '/userswitch'
  );

  const value = {
    workspaces,
    workspaceCompanies,
    selectedCompanyId,
    selectedOwnerId,
    permissions,
    ownerModules,
    setSelectedOwnerId,
    workspaceBootstrapped,
    isWorkspaceBootstrapWaiting: showBootstrapWait,
    /** ``true`` only when the user is actively acting on a guest (teamlid) workspace. */
    isGuestMode,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {showBootstrapWait ? (
        <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 text-gray-600">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#23BD92] border-t-transparent" />
          <span className="text-sm">Werkruimtes laden...</span>
        </div>
      ) : (
        children
      )}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
