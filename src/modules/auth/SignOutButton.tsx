"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function SignOutButton() {
  const t = useTranslations("dashboard");

  return (
    <button
      aria-label={t("signOut")}
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="workspace-signout"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" /><span>{t("signOut")}</span>
    </button>
  );
}
