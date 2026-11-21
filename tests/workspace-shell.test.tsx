import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Role } from "@prisma/client";
import en from "../messages/en.json";

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async (namespace: keyof typeof en) => (key: string) => {
    let current: unknown = en[namespace];
    for (const part of key.split(".")) current = (current as Record<string, unknown>)[part];
    if (typeof current !== "string") throw new Error(`Missing translation: ${namespace}.${key}`);
    return current;
  },
}));
vi.mock("@/modules/auth/SignOutButton", () => ({ SignOutButton: () => <button>Sign Out</button> }));
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";

describe("Workspace shell server-rendered integration", () => {
  it.each(["ADMIN", "PARENT", "STUDENT", "TEACHER", "ACCOUNTANT"] as Role[])("renders role-specific navigation for %s without data writes", async role => {
    const result = renderToStaticMarkup(await WorkspaceShell({ active: "home", role, userName: "Test User", schoolName: "Test School", title: "Overview", children: <h1>Page content</h1> }));
    expect(result).toContain('href="#workspace-content"');
    expect(result).toContain('id="workspace-content"');
    expect(result).toContain('aria-current="page"');
    expect(result).toContain('href="/ar"');
    expect(result).toContain("Test School");
    if (role === "STUDENT") {
      expect(result).not.toContain('href="/en/students"');
      expect(result).not.toContain('href="/en/finance/summary"');
    }
    if (role === "PARENT") expect(result).toContain("My Children");
  });
  it("escapes user-controlled school and display names", async () => {
    const result = renderToStaticMarkup(await WorkspaceShell({ active: "home", role: "ADMIN", userName: '<script>alert(1)</script>', schoolName: '<img src=x onerror=alert(1)>', title: "Overview", children: <h1>Page</h1> }));
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<img src=x');
    expect(result).toContain("&lt;script&gt;");
  });
});
