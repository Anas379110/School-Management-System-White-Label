import type { Role } from "@prisma/client";

export type WorkspaceSection = "home" | "students" | "classrooms" | "attendance" | "grades" | "finance" | "notifications";
export type WorkspaceLink = { key: WorkspaceSection; href: string; labelKey: string };

/** Navigation mirrors existing page access. It never replaces server authorization. */
export function workspaceLinks(role: Role): WorkspaceLink[] {
  const modules: Record<Role, WorkspaceLink[]> = {
    ADMIN: [
      { key: "students", href: "/students", labelKey: "students" },
      { key: "classrooms", href: "/classrooms", labelKey: "classrooms" },
      { key: "finance", href: "/finance/summary", labelKey: "finance" },
    ],
    TEACHER: [
      { key: "attendance", href: "/attendance", labelKey: "attendance" },
      { key: "grades", href: "/grades", labelKey: "grades" },
      { key: "classrooms", href: "/classrooms", labelKey: "classrooms" },
    ],
    PARENT: [
      { key: "students", href: "/students", labelKey: "myChildren" },
      { key: "finance", href: "/finance/summary", labelKey: "finance" },
    ],
    ACCOUNTANT: [
      { key: "finance", href: "/finance/fee-structures", labelKey: "finance" },
      { key: "students", href: "/students", labelKey: "students" },
    ],
    STUDENT: [],
  };
  return [
    { key: "home", href: "/", labelKey: "home" },
    ...modules[role],
    { key: "notifications", href: "/notifications", labelKey: "notifications" },
  ];
}

export function localizedPath(locale: string, path: string): string {
  return `/${locale === "ar" ? "ar" : "en"}${path === "/" ? "" : path}`;
}
