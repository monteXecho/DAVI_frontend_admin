/**
 * API Module - Barrel Export
 * 
 * This file provides a clean, centralized way to import all API hooks.
 * 
 * Usage:
 *   import { useCompanies, useUsers, useDocuments } from '@/lib/api';
 * 
 * Benefits:
 * - Single import point for all APIs
 * - Easy to find and use APIs
 * - Cleaner imports in components
 * - Better tree-shaking support
 */

// Core API functionality
export { useApiCore } from './useApiCore';

// Domain-specific API hooks
export { useCompanies } from './companies';
export { useAdmins } from './admins';
export { useUsers } from './users';
export { useDocuments } from './documents';
export { useRoles } from './roles';
export { useFolders } from './folders';
export { useStats } from './stats';
export { useDocumentChat } from './documentChat';
export { useAuth } from './auth';

