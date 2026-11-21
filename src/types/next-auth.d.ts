import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

// راجع CLAUDE.md — لا any: نوسّع أنواع next-auth رسمياً بدل استخدام any بالكود.
// الدور مُعرَّف بـ enum Role من Prisma وليس string عاماً: يجعل استدعاءات hasRole
// في مسارات API مؤمَّنة بالنوع، وأي قيمة خارج الأدوار المعروفة تفشل في tsc.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
