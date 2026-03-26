'use client';

import { useKeycloak } from '@react-keycloak/web';
import { useMaintenance } from '@/context/MaintenanceContext';
import UnderConstructionPage from './UnderConstructionPage';

/**
 * Renders UnderConstructionPage when maintenance mode is on or backend is unreachable,
 * unless the user is a super admin. Super admins always see the app.
 */
export default function MaintenanceGate({ children }) {
  const { keycloak, initialized } = useKeycloak();
  const { showConstruction, checkedOnce } = useMaintenance();

  if (!initialized || !keycloak?.authenticated) {
    return children;
  }

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isSuperAdmin = roles.includes('super_admin');

  if (isSuperAdmin) {
    return children;
  }

  if (showConstruction && checkedOnce) {
    const handleContact = () => {
      window.location.href = 'mailto:support@davi.nl?subject=Onderhoud DAVI';
    };
    return <UnderConstructionPage onContact={handleContact} />;
  }

  return children;
}
