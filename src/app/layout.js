import "@/app/globals.css";
import ChatColdOpenInlineScript from "@/components/ChatColdOpenInlineScript";
import ChatPublicStartupRedirect from "@/components/ChatPublicStartupRedirect";
import KeycloakProviderWrapper from "@/components/KeycloakProviderWrapper";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import { requestIsChatPublicHost, DAVI_PATHNAME_HEADER } from "@/lib/chatPublicHost";
import { Montserrat } from "next/font/google";
import { cookies, headers } from "next/headers";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const isProduction = process.env.NODE_ENV === "production";

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const isChatHost = requestIsChatPublicHost(headersList, cookieStore);
  const pathname = headersList.get(DAVI_PATHNAME_HEADER) ?? "";
  const isPublicChatPath = pathname.startsWith("/publicChat");
  const suppressAdminPwa =
    isChatHost || isPublicChatPath;

  const adminProgressierManifest =
    process.env.NEXT_PUBLIC_ADMIN_PROGRESSIER_MANIFEST_URL ||
    "https://progressier.app/GeBtvVp5TAAGbHE3O2GE/progressier.json";

  let manifestHref = null;
  if (isProduction) {
    if (suppressAdminPwa) {
      /* Nested publicChat layouts set metadata.manifest (see launcher + install-manifest routes). */
      manifestHref = null;
    } else {
      manifestHref = adminProgressierManifest;
    }
  }

  return (
    <html lang="en">
      <head suppressHydrationWarning>
        {manifestHref ? (
          <link rel="manifest" href={manifestHref} />
        ) : null}
      </head>

      <body
        className={`${montserrat.className} lg:h-screen`}
        suppressHydrationWarning
      >
        <ChatColdOpenInlineScript />
        <ThirdPartyScripts disableProgressier={suppressAdminPwa} />
        <ChatPublicStartupRedirect enabled={isChatHost} />
        <KeycloakProviderWrapper suppressKeycloak={isChatHost}>
          {children}
        </KeycloakProviderWrapper>
      </body>
    </html>
  );
}
