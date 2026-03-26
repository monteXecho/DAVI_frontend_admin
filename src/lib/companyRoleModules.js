/**
 * Modules that may be assigned to a company-user role (folder-based roles).
 * Excludes admin-only and public flows: PublicChat (no login), Webcrawler, Nextcloud, Admin Dashboard, etc.
 */
export const COMPANY_ROLE_ASSIGNABLE_MODULE_NAMES = [
  'Documenten chat',
  'GGD Checks',
  'CreatieChat',
  'WebChat',
]

export function isCompanyRoleAssignableModule(name) {
  return Boolean(name && COMPANY_ROLE_ASSIGNABLE_MODULE_NAMES.includes(name))
}
