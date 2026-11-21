import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, ChevronRight, Sparkles, CheckCircle2, Bell } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";
import { countUnreadNotifications } from "@/modules/notifications/service";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { LearningIllustration, SectionIcon } from "@/components/ui/SchoolIcons";
import { localizedPath, workspaceLinks } from "@/modules/dashboard/navigation";

export default async function HomePage() {
  const session = await requireSession();
  const t = await getTranslations("workspace");
  const dashboard = await getTranslations("dashboard");
  const locale = await getLocale();
  const settings = await getSchoolSettings();
  const unreadCount = await countUnreadNotifications(session.user.id);
  const links = workspaceLinks(session.user.role).filter(link => link.key !== "home" && link.key !== "notifications");

  return (
    <WorkspaceShell active="home" role={session.user.role} userName={session.user.name ?? ""} schoolName={settings.schoolName} title={t("home")}>
      <section className="welcome-banner" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="eyebrow-pill"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />{t("schoolWorkspace")}</span>
          <h1 id="welcome-title">{t("hello", { name: session.user.name ?? "" })}</h1>
          <p>{t("welcomeDescription")}</p>
          {links[0] && <Link className="hero-button" href={localizedPath(locale, links[0].href)}>{dashboard(links[0].labelKey)}<ArrowUpRight className="directional-icon h-4 w-4" aria-hidden="true" /></Link>}
        </div>
        <LearningIllustration />
      </section>

      <section className="module-section" aria-labelledby="modules-title">
        <div className="section-heading"><div><p className="section-kicker">{t("workspace")}</p><h2 id="modules-title">{t("yourModules")}</h2></div><span className="role-chip">{t(`roles.${session.user.role}`)}</span></div>
        <div className="module-grid">
          {links.map((link, index) => (
            <Link key={link.key} href={localizedPath(locale, link.href)} className={`module-card module-tone-${index % 3}`}>
              <div className="module-card-top"><span className="module-icon"><SectionIcon section={link.key} className="h-6 w-6" /></span><ArrowUpRight aria-hidden="true" className="directional-icon module-arrow h-5 w-5" /></div>
              <h3>{dashboard(link.labelKey)}</h3><p>{t(`descriptions.${link.key}`)}</p><span className="module-open">{t("openModule")}<ChevronRight className="directional-icon h-4 w-4" aria-hidden="true" /></span>
            </Link>
          ))}
          <Link href={localizedPath(locale, "/notifications")} className="module-card module-tone-notifications">
            <div className="module-card-top"><span className="module-icon"><Bell className="h-6 w-6" aria-hidden="true" /></span><span className="notification-number">{unreadCount > 99 ? "99+" : unreadCount}</span></div>
            <h3>{dashboard("notifications")}</h3><p>{t("descriptions.notifications")}</p><span className="module-open">{t("openModule")}<ChevronRight className="directional-icon h-4 w-4" aria-hidden="true" /></span>
          </Link>
        </div>
      </section>

      <section className="workspace-bottom-grid" aria-label={t("helpfulInformation")}>
        <div className="notification-panel"><span className="panel-icon"><CheckCircle2 className="h-6 w-6" aria-hidden="true" /></span><div><h2>{unreadCount === 0 ? t("allCaughtUp") : t("unreadTitle", { count: unreadCount })}</h2><p>{unreadCount === 0 ? t("allCaughtUpDescription") : t("unreadDescription")}</p></div><Link href={localizedPath(locale, "/notifications")} className="text-link">{t("viewNotifications")}<ChevronRight className="directional-icon h-4 w-4" aria-hidden="true" /></Link></div>
        <div className="workspace-note"><span className="note-accent" /><p>{t("workspaceNote")}</p></div>
      </section>
    </WorkspaceShell>
  );
                                                                                                                                                                                          }
