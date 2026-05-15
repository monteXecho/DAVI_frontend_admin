/** Per-chat Web App Manifest so installs from this URL launch back into this chat (start_url). */

export async function generateMetadata({ params }) {
  const { company_admin: companyAdmin, chatName } = await params;
  const base = `/publicChat/${companyAdmin}/${chatName}`;
  return {
    manifest: `${base}/install-manifest`,
  };
}

export default function PublicChatSessionLayout({ children }) {
  return children;
}
