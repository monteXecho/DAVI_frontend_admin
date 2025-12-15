import "@/app/globals.css";
import KeycloakProviderWrapper from "@/components/KeycloakProviderWrapper";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        <link
          rel="manifest"
          href="https://progressier.app/GeBtvVp5TAAGbHE3O2GE/progressier.json"
        />
      </head>

      <body className={`${montserrat.className} lg:h-screen`} suppressHydrationWarning>
        <ThirdPartyScripts />
        <KeycloakProviderWrapper>{children}</KeycloakProviderWrapper>
      </body>
    </html>
  );
}
