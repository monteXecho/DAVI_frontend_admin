"use client";

import { CreativeChatI18nProvider } from "./contexts/CreativeChatI18nContext";
import CreativeChatClient from "./CreativeChatClient";

export default function CreativeChatPage() {
  return (
    <CreativeChatI18nProvider>
      <CreativeChatClient />
    </CreativeChatI18nProvider>
  );
}
