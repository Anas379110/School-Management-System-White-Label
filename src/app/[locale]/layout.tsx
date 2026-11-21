import "../globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";

// كل الصفحات تحت [locale] تعتمد على الجلسة/قاعدة البيانات (headers) — لا يمكن
// توليدها ساكناً، فنمنع محاولة Prerender بدل فشل البناء عند DYNAMIC_SERVER_USAGE.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "School Management System",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  // راجع src/i18n.ts — التحقق من اللغة هنا أيضاً لأن Next يمرر المقطع الديناميكي كـ string
  if (!locales.includes(rawLocale as Locale)) notFound();
  const locale = rawLocale as Locale;
  const messages = await getMessages();
  const settings = await getSchoolSettings();

  // راجع docs/design/UI-UX.md القسم 10: الاتجاه يتغير فعلياً حسب اللغة، لا CSS ثابت
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className={dir === "rtl" ? "font-arabic" : "font-latin"}
        style={
          {
            "--brand-color": settings.primaryColor,
          } as React.CSSProperties
        }
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
