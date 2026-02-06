/**
 * Main API Hook - Composes all domain-specific API hooks
 * 
 * This hook provides backward compatibility by combining all API hooks
 * into a single interface. For new code, prefer using individual hooks
 * from '@/lib/api' for better code organization.
 * 
 * @deprecated For new code, use individual hooks from '@/lib/api'
 * Example: import { useCompanies, useUsers } from '@/lib/api';
 */
import { useCompanies } from './api/companies';
import { useAdmins } from './api/admins';
import { useUsers } from './api/users';
import { useDocuments } from './api/documents';
import { useRoles } from './api/roles';
import { useFolders } from './api/folders';
import { useStats } from './api/stats';
import { useDocumentChat } from './api/documentChat';
import { useAuth } from './api/auth';
import { useApiCore } from './api/useApiCore';

export function useApi() {
  // Get core functionality (loading, error states)
  const { loading, error } = useApiCore();

  // Get all domain-specific hooks
  const companies = useCompanies();
  const admins = useAdmins();
  const users = useUsers();
  const documents = useDocuments();
  const roles = useRoles();
  const folders = useFolders();
  const stats = useStats();
  const documentChat = useDocumentChat();
  const auth = useAuth();

  // Return combined API for backward compatibility
  return {
    // Document Chat
    ...documentChat,

    // Documents
    ...documents,

    // Companies
    ...companies,

    // Admins
    ...admins,

    // Users
    ...users,

    // Stats
    ...stats,

    // Roles
    ...roles,

    // Folders
    ...folders,

    // Auth
    ...auth,

    // Core state
    loading,
    error,
  };
}
