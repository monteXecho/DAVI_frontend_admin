import "@/app/globals.css";
import "@fontsource/montserrat/800.css";
import KeycloakProviderWrapper from "@/components/KeycloakProviderWrapper";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className="lg:h-screen">
        <KeycloakProviderWrapper>
          {children}
        </KeycloakProviderWrapper>
      </body>
    </html>
  );
}
