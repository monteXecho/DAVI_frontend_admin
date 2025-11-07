import "@/app/globals.css";
// import "@fontsource/montserrat/800.css";
import KeycloakProviderWrapper from "@/components/KeycloakProviderWrapper";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="https://progressier.app/GeBtvVp5TAAGbHE3O2GE/progressier.json"/>
        <script defer src="https://progressier.app/GeBtvVp5TAAGbHE3O2GE/script.js"></script>
      </head>
      <body className="lg:h-screen">
        <KeycloakProviderWrapper>
          {children}
        </KeycloakProviderWrapper>
      </body>
    </html>
  );
}
