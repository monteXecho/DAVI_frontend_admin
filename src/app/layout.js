import "@/app/globals.css";
import KeycloakProviderWrapper from "@/components/KeycloakProviderWrapper";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import { Montserrat } from "next/font/google";
import { headers } from "next/headers";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

function chatOnlyHostnameNormalized() {
  const raw =
    process.env.CHAT_PUBLIC_HOSTNAME || "https://chat.daviapp.nl";
  return raw.replace(/^https?:\/\//, "").trim().split("/")[0].split(":")[0].toLowerCase();
}

const isProduction = process.env.NODE_ENV === "production";

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const hostHeader =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const hostname = hostHeader.split(":")[0].toLowerCase();
  const isChatHost = !!hostname && hostname === chatOnlyHostnameNormalized();

  const adminProgressierManifest =
    process.env.NEXT_PUBLIC_ADMIN_PROGRESSIER_MANIFEST_URL ||
    "https://progressier.app/GeBtvVp5TAAGbHE3O2GE/progressier.json";

  const chatProgressierManifest =
    process.env.NEXT_PUBLIC_CHAT_PROGRESSIER_MANIFEST_URL || null;

  let manifestHref = null;
  if (isProduction) {
    if (isChatHost) {
      manifestHref = chatProgressierManifest || null;
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
        <ThirdPartyScripts />
        <KeycloakProviderWrapper>{children}</KeycloakProviderWrapper>
      </body>
    </html>
  );
}
