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
 * Matches Next route: /publicChat/[chatName]/[company_admin] (canonical) and API
 * `/public-chat/{company_admin}/{chat_name}`. Canonical browser URLs put chat slug first so sibling
 * chats under one admin do not share `/publicChat/{sameUuid}/…` (install / link capturing quirk).
 */
export function buildPublicChatPageUrl(adminUserId, chatName) {
  const origin = getPublicChatSiteOrigin()
  const admin = encodeURIComponent(adminUserId || '')
  const chat = encodeURIComponent(chatName || '')
  return `${origin}/publicChat/${chat}/${admin}`
}
