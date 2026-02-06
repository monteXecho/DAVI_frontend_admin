'use client';

import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApi } from '@/lib/useApi';

// Define which paths are admin-only (BEHEER) vs module paths (MODULES)
const ADMIN_PATHS = ['/rollen', '/rol-pz', '/gebruikers', '/documenten', '/mappen', '/compagnies'];
const MODULE_PATHS = ['/documentchat', '/GGD', '/creatiechat', '/webchat', '/bkr', '/vgc', '/3-uurs'];

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();
  const pathname = usePathname();
  const router = useRouter();
  const { getUser } = useApi();
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    // Not authenticated → go to Keycloak
    if (!keycloak.authenticated) {
      keycloak.login();
      return;
    }

    // Token expiry guard
    const tokenParsed = keycloak.tokenParsed;
    const currentTime = Math.floor(Date.now() / 1000);
    if (tokenParsed && tokenParsed.exp && tokenParsed.exp < currentTime) {
      keycloak.logout({ redirectUri: window.location.origin });
      keycloak.login();
      return;
    }

    const roles = tokenParsed?.realm_access?.roles || [];
    const isSuperAdmin = roles.includes('super_admin');
    const isCompanyAdmin = roles.includes('company_admin');
    const isCompanyUser = roles.includes('company_user');

    // Check URL access based on user role
    if (!isSuperAdmin) {
      const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path));
      const isModulePath = MODULE_PATHS.some(path => pathname.startsWith(path));

      // Block company admins from accessing MODULES paths
      if (isCompanyAdmin && isModulePath && pathname !== '/userswitch') {
        // Company admin trying to access MODULES - block and redirect
        router.replace('/rollen'); // Redirect to first available admin page
        return;
      }

      // Check if company user has teamlid access before blocking BEHEER paths
      if (isCompanyUser && isAdminPath && pathname !== '/userswitch') {
        // Load user data if not already loaded to check teamlid access
        if (!userLoaded) {
          getUser().then(userData => {
            setUser(userData);
            setUserLoaded(true);
          }).catch(() => {
            setUserLoaded(true);
          });
          return; // Wait for user data before checking
        }

        // Check if user has teamlid access
        // Teamlid access means the user is acting on a guest workspace (similar to LeftSidebar logic)
        let hasTeamlidAccess = false;
        if (user && user.is_teamlid) {
          // Check if user is acting on a guest workspace
          if (typeof window !== 'undefined') {
            try {
              const actingOwnerId = window.localStorage.getItem('daviActingOwnerId');
              const actingOwnerUserId = window.localStorage.getItem('daviActingOwnerUserId');
              const isGuest = window.localStorage.getItem('daviActingOwnerIsGuest') === 'true';
              
              // Case 1: actingOwnerId is different from user's own ID - definitely a guest workspace
              if (actingOwnerId && actingOwnerUserId && String(actingOwnerUserId) !== String(user.user_id)) {
                hasTeamlidAccess = true;
              } 
              // Case 2: actingOwnerId matches user's own ID but isGuest flag is set - guest with same ownerId
              else if (actingOwnerId && actingOwnerUserId && String(actingOwnerUserId) === String(user.user_id) && isGuest) {
                hasTeamlidAccess = true;
              }
            } catch (e) {
              // ignore storage errors
            }
          }
        }

        if (!hasTeamlidAccess) {
          // Company user without teamlid access trying to access BEHEER - block and redirect
          router.replace('/documentchat'); // Redirect to default module
          return;
        }
        // If hasTeamlidAccess is true, allow access to BEHEER paths
      }

      // For company users, also check if they have access to the specific module they're trying to access
      if (isCompanyUser && isModulePath && pathname !== '/userswitch') {
        // Load user data if not already loaded to check module access
        if (!userLoaded) {
          getUser().then(userData => {
            setUser(userData);
            setUserLoaded(true);
          }).catch(() => {
            setUserLoaded(true);
          });
          return; // Wait for user data before checking
        }

        // Check if user has access to this specific module
        if (user) {
          let hasAccess = false;
          if (pathname.startsWith('/documentchat')) {
            hasAccess = user.modules?.['Documenten chat']?.enabled === true;
          } else if (pathname.startsWith('/GGD')) {
            hasAccess = user.modules?.['GGD Checks']?.enabled === true;
          } else if (pathname.startsWith('/creatiechat')) {
            hasAccess = user.modules?.['CreatieChat']?.enabled === true;
          } else if (pathname.startsWith('/webchat')) {
            hasAccess = user.modules?.['WebChat']?.enabled === true;
          } else {
            // For other module paths, allow if user has any module enabled
            hasAccess = Object.values(user.modules || {}).some(module => module.enabled === true);
          }

          if (!hasAccess) {
            // User doesn't have access to this module - redirect to first available module
            if (user.modules?.['Documenten chat']?.enabled) {
              router.replace('/documentchat');
            } else if (user.modules?.['GGD Checks']?.enabled) {
              router.replace('/GGD');
            } else if (user.modules?.['CreatieChat']?.enabled) {
              router.replace('/creatiechat');
            } else if (user.modules?.['WebChat']?.enabled) {
              router.replace('/webchat');
            } else {
              router.replace('/documentchat'); // Default fallback
            }
            return;
          }
        }
      }
    }

    if (isSuperAdmin) {
      // Super admins should never be forced into workspace selection
      return;
    }

    // Workspace selection: if we have no acting owner stored yet,
    // force the user to '/userswitch' to choose a mode.
    if (typeof window !== 'undefined') {
      const actingOwnerId = window.localStorage.getItem('daviActingOwnerId');
      if (!actingOwnerId && pathname !== '/userswitch') {
        router.replace('/userswitch');
      }
    }
  }, [initialized, keycloak, pathname, router, user, userLoaded, getUser]);

  if (!initialized) return null;
  if (!keycloak.authenticated) return null;

  return children;
}
