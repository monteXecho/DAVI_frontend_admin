import "@/app/globals.css";
import "@fontsource/montserrat/800.css";
import KeycloakProviderWrapper from "@/components/KeycloakProviderWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className="lg:h-screen">
        <KeycloakProviderWrapper>
          <ProtectedRoute>{children}</ProtectedRoute>
        </KeycloakProviderWrapper>
      </body>
    </html>
  );
}
