/**
 * Permission utility functions for teamlid users
 * 
 * Permissions structure (guest_access format):
 * - can_role_write: Controls Rollen (write if true, read-only if false)
 * - can_folder_write: Controls Mappen (write if true, read-only if false)
 * - can_user_write: Controls Gebruikers (write if true, read-only if false)
 * - can_document_write: Controls Documenten (write if true, read-only if false)
 * 
 * Backward compatibility (teamlid_permissions format):
 * - role_folder_modify_permission: Controls Rollen and Mappen
 * - user_create_modify_permission: Controls Gebruikers
 * - document_modify_permission: Controls Documenten
 */

/**
 * Check if user is acting on their own workspace
 * @param {object} user - User object from getUser()
 * @returns {boolean} - True if acting on own workspace
 */
function isActingOnOwnWorkspace(user) {
  if (!user || !user.user_id) return false;
  
  if (typeof window === 'undefined') return false;
  
  try {
    const actingOwnerId = window.localStorage.getItem('daviActingOwnerId');
    // If acting on own workspace (actingOwnerId === user_id), full access
    return actingOwnerId && String(actingOwnerId) === String(user.user_id);
  } catch (e) {
    return false;
  }
}

/**
 * Check if a permission value allows write operations
 * @param {string|boolean} permission - Permission value ("True"/"False" or boolean)
 * @returns {boolean} - True if write is allowed
 */
function canWrite(permission) {
  if (permission === undefined || permission === null) return false;
  if (typeof permission === 'boolean') return permission;
  if (typeof permission === 'string') {
    return permission.toLowerCase() === 'true';
  }
  return false;
}

/**
 * Check if user can write to Rollen (Roles)
 * @param {object} user - User object from getUser()
 * @returns {boolean}
 */
export function canWriteRoles(user) {
  if (!user) return false;
  // CRITICAL: If acting on own workspace, always allow full access
  if (isActingOnOwnWorkspace(user)) return true;
  // If not teamlid, allow (company_admin has full access)
  if (!user.is_teamlid && !user.guest_permissions) return true;
  
  // Check guest_access permissions first (new format)
  if (user.guest_permissions) {
    return canWrite(user.guest_permissions.can_role_write);
  }
  
  // Fallback to old teamlid_permissions format
  const perms = user.teamlid_permissions || {};
  return canWrite(perms.role_folder_modify_permission);
}

/**
 * Check if user can write to Mappen (Folders)
 * @param {object} user - User object from getUser()
 * @returns {boolean}
 */
export function canWriteFolders(user) {
  if (!user) return false;
  // CRITICAL: If acting on own workspace, always allow full access
  if (isActingOnOwnWorkspace(user)) return true;
  // If not teamlid, allow (company_admin has full access)
  if (!user.is_teamlid && !user.guest_permissions) return true;
  
  // Check guest_access permissions first (new format)
  if (user.guest_permissions) {
    return canWrite(user.guest_permissions.can_folder_write);
  }
  
  // Fallback to old teamlid_permissions format
  const perms = user.teamlid_permissions || {};
  return canWrite(perms.role_folder_modify_permission);
}

/**
 * Check if user can write to Gebruikers (Users)
 * @param {object} user - User object from getUser()
 * @returns {boolean}
 */
export function canWriteUsers(user) {
  if (!user) return false;
  // CRITICAL: If acting on own workspace, always allow full access
  if (isActingOnOwnWorkspace(user)) return true;
  // If not teamlid, allow (company_admin has full access)
  if (!user.is_teamlid && !user.guest_permissions) return true;
  
  // Check guest_access permissions first (new format)
  if (user.guest_permissions) {
    return canWrite(user.guest_permissions.can_user_write);
  }
  
  // Fallback to old teamlid_permissions format
  const perms = user.teamlid_permissions || {};
  return canWrite(perms.user_create_modify_permission);
}

/**
 * Check if user can write to Documenten (Documents)
 * @param {object} user - User object from getUser()
 * @returns {boolean}
 */
export function canWriteDocuments(user) {
  if (!user) return false;
  // CRITICAL: If acting on own workspace, always allow full access
  if (isActingOnOwnWorkspace(user)) return true;
  // If not teamlid, allow (company_admin has full access)
  if (!user.is_teamlid && !user.guest_permissions) return true;
  
  // Check guest_access permissions first (new format)
  if (user.guest_permissions) {
    return canWrite(user.guest_permissions.can_document_write);
  }
  
  // Fallback to old teamlid_permissions format
  const perms = user.teamlid_permissions || {};
  return canWrite(perms.document_modify_permission);
}

