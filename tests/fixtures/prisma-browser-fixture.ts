// Only copied into a temporary local test app. Never imported by production code.
import { hashSync } from "bcryptjs";
export const prisma = {
  schoolSettings: { findFirst: async () => ({ id: "fixture", schoolName: "School Management Demo", logoUrl: null, primaryColor: "#1d4ed8", country: "SA", defaultLocale: "ar" }) },
  user: { findUnique: async () => ({ id: "fixture-admin", email: "admin@example.test", fullName: "Admin", role: "ADMIN", isActive: true, passwordHash: hashSync("local-fixture-only", 4), failedLoginAttempts: 0, lockedUntil: null }) },
  notification: { count: async () => 0, findMany: async () => [] },
  student: { findMany: async () => [], count: async () => 0 },
  classRoom: { findMany: async () => [] },
};
