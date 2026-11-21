import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requestPasswordResetSchema } from "@/modules/auth/passwordResetSchema";
import { generateResetToken } from "@/modules/auth/passwordReset";

/**
 * POST /api/v1/auth/reset-password/request — راجع DECISIONS.md (فجوة Password
 * Reset الموثّقة سابقاً، صُححت الآن).
 *
 * ⚠️ يُعيد دائماً نفس رسالة النجاح بغض النظر عن وجود البريد فعلياً بالنظام —
 * قاعدة أمنية غير قابلة للتفاوض (CLAUDE.md القسم 10): لا يجوز السماح لمهاجم
 * بمعرفة أي بريد إلكتروني مسجّل بالنظام عبر رسائل خطأ مختلفة (User Enumeration).
 *
 * ⚠️ NEEDS TESTING: إرسال البريد الفعلي عبر Resend غير مُختبر مقابل حساب حقيقي
 * بهذه الجلسة (بلا اتصال شبكة) — منطق توليد/تخزين الرمز مُختبر وحدياً ومضمون،
 * لكن التسليم الفعلي للبريد يحتاج تحققاً بعد التشغيل الحقيقي.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بريد إلكتروني غير صحيح");

  // Fail before looking up the email so availability never reveals account existence.
  if (process.env.NODE_ENV === "production" &&
      (!process.env.RESEND_API_KEY || !process.env.RESET_EMAIL_FROM)) {
    return apiError("SERVICE_UNAVAILABLE", "خدمة استعادة كلمة المرور غير متاحة في النسخة التجريبية");
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user && user.isActive) {
    const { token, tokenHash, expiresAt } = generateResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt },
    });

    // NEEDS TESTING فعلي — راجع الملاحظة أعلاه
    await sendResetEmailBestEffort(user.email, token);
  }

  return apiSuccess({ message: "إذا كان البريد مسجّلاً بالنظام، سيصلك رابط إعادة التعيين" });
}

async function sendResetEmailBestEffort(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      // بيئة تطوير محلية بلا مفتاح Resend — نطبع الرابط بالـ Console بدل الفشل الصامت
      console.log(`[DEV] رابط إعادة تعيين كلمة المرور لـ ${email}: ${resetLink}`);
    } else {
      // إنتاج بلا بريد مُعَد: لا نطبع الرابط أبداً (يحتوي رمزاً خاماً يساوي كلمة
      // مرور مؤقتة — تسريبه في سجلات الاستضافة يكسر أمن الحساب). نكتفي بتنبيه
      // تشغيلي بلا أي بيانات حساسة، والمستخدم يرى نفس الرسالة الموحدة دائماً.
      console.warn("password reset requested but RESEND_API_KEY is not configured");
    }
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESET_EMAIL_FROM,
        to: email,
        subject: "إعادة تعيين كلمة المرور",
        html: `<p>اضغط الرابط التالي لإعادة تعيين كلمة المرور (صالح لساعة واحدة): <a href="${resetLink}">${resetLink}</a></p>`,
      }),
    });
  } catch (err) {
    // لا نفشل الطلب كاملاً إن تعذّر إرسال البريد — نسجّل الخطأ فقط
    console.error("تعذّر إرسال بريد إعادة التعيين:", err);
  }
}
