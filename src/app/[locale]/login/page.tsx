import { getLocale, getTranslations } from "next-intl/server";
import { Languages, Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";
import { LoginForm } from "@/modules/auth/LoginForm";
import { SchoolMark, LearningIllustration } from "@/components/ui/SchoolIcons";
import { localizedPath } from "@/modules/dashboard/navigation";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  const ui = await getTranslations("workspace");
  const locale = await getLocale();
  const settings = await getSchoolSettings();
  const otherLocale = locale === "ar" ? "en" : "ar";

  return (
    <main className="login-page">
      <section className="login-story" aria-labelledby="login-story-title">
        <div className="login-story-brand"><span className="brand-mark"><SchoolMark className="h-7 w-7" /></span><span>{settings.schoolName}</span></div>
        <div className="login-story-content"><span className="eyebrow-pill">{ui("schoolWorkspace")}</span><h1 id="login-story-title">{ui("loginHeadline")}</h1><p>{ui("loginDescription")}</p><LearningIllustration className="login-illustration" /><div className="login-story-points">{["loginPointOne", "loginPointTwo"].map(key => <span key={key}><Check className="h-4 w-4" aria-hidden="true" />{ui(key)}</span>)}</div></div>
        <p className="login-story-footer">{ui("builtForLearning")}</p>
      </section>
      <section className="login-form-region" aria-labelledby="login-title">
        <div className="login-language"><Link href={localizedPath(otherLocale, "/login")} hrefLang={otherLocale} className="language-switch" aria-label={ui("switchLanguage")}><Languages className="h-4 w-4" aria-hidden="true" /><span lang={otherLocale}>{locale === "ar" ? "English" : "العربية"}</span></Link></div>
        <div className="login-card">
          <div className="login-school-mark">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt={settings.schoolName} className="h-12 w-12 object-contain" />
            ) : <SchoolMark className="h-8 w-8" />}
          </div>
          <p className="login-school-name">{settings.schoolName}</p>
          <h2 id="login-title">{t("loginTitle")}</h2><p className="login-subtitle">{t("loginSubtitle")}</p>
          <LoginForm />
          <Link href={localizedPath(locale, "/forgot-password")} className="login-recovery">{t("forgotPassword")}<ArrowUpRight className="directional-icon h-4 w-4" aria-hidden="true" /></Link>
          <div className="login-access-note"><span className="status-dot" /><p>{ui("loginAccessNote")}</p></div>
        </div>
        <p className="login-footer">{ui("builtForLearning")}</p>
      </section>
    </main>
  );
}
