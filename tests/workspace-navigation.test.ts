import { describe, expect, it } from "vitest";
import { localizedPath, workspaceLinks } from "@/modules/dashboard/navigation";
import en from "../messages/en.json";
import ar from "../messages/ar.json";

describe("Workspace navigation permissions and localization", () => {
  it("keeps administrator modules limited to the existing authorized pages", () => {
    expect(workspaceLinks("ADMIN").map(link => link.href)).toEqual(["/", "/students", "/classrooms", "/finance/summary", "/notifications"]);
  });
  it("does not offer classroom administration or other students to a student", () => {
    expect(workspaceLinks("STUDENT").map(link => link.href)).toEqual(["/", "/notifications"]);
  });
  it("uses existing parent-scoped and accountant finance entrypoints", () => {
    expect(workspaceLinks("PARENT").find(link => link.key === "students")?.labelKey).toBe("myChildren");
    expect(workspaceLinks("PARENT").some(link => link.key === "classrooms")).toBe(false);
    expect(workspaceLinks("ACCOUNTANT").find(link => link.key === "finance")?.href).toBe("/finance/fee-structures");
  });
  it("keeps teacher entrypoints and removes admin finance actions", () => {
    const links = workspaceLinks("TEACHER");
    expect(links.some(link => link.key === "attendance")).toBe(true);
    expect(links.some(link => link.key === "grades")).toBe(true);
    expect(links.some(link => link.key === "finance")).toBe(false);
  });
  it.each(["ar", "en"])("keeps every generated URL within the chosen locale %s", locale => {
    for (const role of ["ADMIN", "TEACHER", "PARENT", "ACCOUNTANT", "STUDENT"] as const) {
      for (const link of workspaceLinks(role)) expect(localizedPath(locale, link.href)).toMatch(new RegExp(`^/${locale}(?:/|$)`));
    }
    expect(localizedPath(locale, "/")).toBe(`/${locale}`);
  });
  it("does not allow an unsupported locale to form an arbitrary URL", () => {
    expect(localizedPath("https://example.invalid", "/login")).toBe("/en/login");
  });
  it("has matching Arabic and English UI keys, including role labels and module descriptions", () => {
    const keys = (value: object): string[] => Object.entries(value).flatMap(([key, item]) => typeof item === "object" ? keys(item).map(child => `${key}.${child}`) : [key]).sort();
    expect(keys(ar.workspace)).toEqual(keys(en.workspace));
    expect(Object.values(en.workspace.roles)).toHaveLength(5);
  });
});
