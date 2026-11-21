import { NextResponse } from "next/server";

/**
 * راجع docs/api/API.md — "أخطاء موحّدة: { error: { code, message } }".
 * نقطة واحدة لبناء كل استجابات الخطأ حتى لا يتكرر الشكل يدوياً بكل Route
 * ويختلف بالخطأ بمكان عن آخر.
 */
export function apiError(
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "CONFLICT" | "SERVICE_UNAVAILABLE",
  message: string
) {
  const statusMap: Record<string, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    CONFLICT: 409,
    SERVICE_UNAVAILABLE: 503,
  };

  return NextResponse.json({ error: { code, message } }, { status: statusMap[code] });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
