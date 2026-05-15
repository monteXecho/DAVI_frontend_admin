import HomeClient from "@/app/HomeClient";
import { requestIsChatPublicHost } from "@/lib/chatPublicHost";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/** Default app home; on the public chat hostname this must never mount Keycloak (`ProtectedRoute`). */
export default async function Home() {
  if (requestIsChatPublicHost(await headers(), await cookies())) {
    redirect("/publicChat");
  }
  return <HomeClient />;
}
