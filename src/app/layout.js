import "@/app/globals.css";
import KeycloakProviderWrapper from "@/components/KeycloakProviderWrapper";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="manifest"
          href="https://progressier.app/GeBtvVp5TAAGbHE3O2GE/progressier.json"
        />
        <script
          defer
          src="https://progressier.app/GeBtvVp5TAAGbHE3O2GE/script.js"
        ></script>
      </head>

      <body className={`${montserrat.className} lg:h-screen`}>
        <KeycloakProviderWrapper>{children}</KeycloakProviderWrapper>
      </body>
    </html>
  );
}
