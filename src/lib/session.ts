import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { hasRole } from "@/modules/auth/rbac";
import type { Role } from "@prisma/client";

/**
 * نقطة واحدة لحماية صفحات Server Components — تُستخدم بكل صفحة تحتاج دوراً محدداً
 * بدل تكرار منطق التحقق يدوياً بكل صفحة (راجع CLAUDE.md القسم 8).
 */
export async function requireSession(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (allowedRoles && !hasRole(session.user.role, allowedRoles)) {
    redirect("/");
  }

  return session;
}
