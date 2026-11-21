import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { Role } from "@prisma/client";
import { Languages, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/modules/auth/SignOutButton";
import { localizedPath, workspaceLinks, type WorkspaceSection } from "@/modules/dashboard/navigation";
import { SchoolMark, SectionIcon } from "@/components/ui/SchoolIcons";

type Props = {
  children: React.ReactNode;
  active: WorkspaceSection;
  role: Role;
  userName: string;
  schoolName: string;
  title: string;
};

export async function WorkspaceShell({ children, active, role, userName, schoolName, title }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("workspace");
  const dashboard = await getTranslations("dashboard");
  const links = workspaceLinks(role);
  const current = links.find(link => link.key === active) ?? links[0];
  const otherLocale = locale === "ar" ? "en" : "ar";
  const navigation = (mobile: boolean) => (
    <nav aria-label={t(mobile ? "mobileNavigation" : "navigation")} className={mobile ? "mobile-navigation" : "workspace-navigation"}>
      {links.map(link => (
        <Link key={link.key} href={localizedPath(locale, link.href)} aria-current={active === link.key ? "page" : undefined} className="workspace-nav-link">
          <SectionIcon section={link.key} className="h-5 w-5 shrink-0" />
          <span>{link.key === "home" ? t("home") : dashboard(link.labelKey)}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="workspace-root">
      <a className="skip-link" href="#workspace-content">{t("skipToContent")}</a>
      <aside className="workspace-sidebar">
        <Link href={localizedPath(locale, "/")} className="workspace-brand">
          <span className="brand-mark"><SchoolMark className="h-7 w-7" /></span>
          <span><strong>{schoolName}</strong><small>{t("schoolWorkspace")}</small></span>
        </Link>
        <p className="sidebar-label">{t("workspace")}</p>
        {navigation(false)}
        <div className="sidebar-footnote"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><span>{t("roleAccess")}</span></div>
        <div className="workspace-profile">
          <span className="profile-avatar" aria-hidden="true">{userName.trim().charAt(0) || "•"}</span>
          <div><strong>{userName}</strong><span>{t(`roles.${role}`)}</span></div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="min-w-0"><p className="topbar-eyebrow">{t("schoolWorkspace")}</p><p className="topbar-title">{title}</p></div>
          <div className="topbar-actions">
            <Link href={localizedPath(otherLocale, current.href)} hrefLang={otherLocale} className="language-switch" aria-label={t("switchLanguage")}><Languages className="h-4 w-4" aria-hidden="true" /><span lang={otherLocale}>{locale === "ar" ? "English" : "العربية"}</span></Link>
            <SignOutButton />
          </div>
        </header>
        {navigation(true)}
        <main id="workspace-content" tabIndex={-1} className="workspace-content">{children}</main>
        <footer className="workspace-footer"><SchoolMark className="h-4 w-4" /><span>{schoolName}</span><span className="footer-divider">·</span><span>{t("builtForLearning")}</span></footer>
      </div>
    </div>
  );
}
