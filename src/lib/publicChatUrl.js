/**
 * Absolute base URL where end users open public chats (chat subdomain).
 * Override per environment with NEXT_PUBLIC_PUBLIC_CHAT_SITE_ORIGIN (no trailing slash).
 * Local admin dev often sets this to http://localhost:3000 so copied links still work.
 */
const DEFAULT_PUBLIC_CHAT_ORIGIN = 'https://chat.daviapp.nl'

export function getPublicChatSiteOrigin() {
  const raw =
    process.env.NEXT_PUBLIC_PUBLIC_CHAT_SITE_ORIGIN ||
    DEFAULT_PUBLIC_CHAT_ORIGIN
  return raw.replace(/\/$/, '')
}

/**
 * Build the absolute URL for the unauthenticated public chat page.
 * Matches Next route: /publicChat/[company_admin]/[chatName] and API /public-chat/{company_admin}/{chat_name}
 * where company_admin is the company admin's user_id (or email) and chat_name is the stored chat name.
 */
export function buildPublicChatPageUrl(adminUserId, chatName) {
  const origin = getPublicChatSiteOrigin()
  const admin = encodeURIComponent(adminUserId || '')
  const chat = encodeURIComponent(chatName || '')
  return `${origin}/publicChat/${admin}/${chat}`
}
