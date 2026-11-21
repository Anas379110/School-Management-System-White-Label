// Run from repository root with DATABASE_URL_FILE, TEST_PASSWORD_FILE and TEST_EMAIL.
// Uses the existing account, reads pages only, and never creates student/classroom records.
import fs from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const port = Number(process.env.TEST_PORT || 3100);
const base = `http://localhost:${port}`;
const output = process.env.TEST_OUTPUT_DIR || "/tmp/school-ui-verification";
fs.mkdirSync(output, { recursive: true });
const fixture = process.env.UI_TEST_FIXTURE === "1";
const root = process.cwd();
const testRoot = fixture ? fs.mkdtempSync(path.join(os.tmpdir(), "school-ui-check-")) : root;
if (fixture) {
  fs.cpSync(root, testRoot, { recursive: true, filter: source => !["node_modules", ".next", ".git"].includes(path.basename(source)) && !path.basename(source).startsWith(".env") });
  fs.symlinkSync(path.join(root, "node_modules"), path.join(testRoot, "node_modules"), "dir");
  fs.copyFileSync(path.join(root, "tests/fixtures/prisma-browser-fixture.ts"), path.join(testRoot, "src/lib/prisma.ts"));
}
const password = fixture ? "local-fixture-only" : fs.readFileSync(process.env.TEST_PASSWORD_FILE, "utf8").trim();
const database = fixture ? "postgresql://unused@localhost/unused" : fs.readFileSync(process.env.DATABASE_URL_FILE, "utf8").trim();
const log = fs.openSync(`${output}/server.log`, "w");
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", String(port)], {
  cwd: testRoot,
  env: { ...process.env, DATABASE_URL: database, NEXTAUTH_URL: base, NODE_ENV: "development", ...(fixture ? { NEXTAUTH_SECRET: "local-fixture-only-not-a-real-secret" } : {}) },
  stdio: ["ignore", log, log],
});
let browser;
const results = [];
const axe = require(process.env.AXE_MODULE || "axe-playwright");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
try {
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null) throw new Error("Test server exited early");
    try { if ((await fetch(`${base}/ar/login`)).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  for (const locale of ["ar", "en"]) {
    await page.goto(`${base}/${locale}/login`);
    await page.locator("#email").waitFor();
    assert(await page.locator("html").getAttribute("dir") === (locale === "ar" ? "rtl" : "ltr"), "Wrong login direction");
    await axe.injectAxe(page);
    const loginViolations = await axe.getViolations(page, undefined, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
    assert(loginViolations.length === 0, `Login accessibility: ${JSON.stringify(loginViolations.map(v => ({id:v.id,nodes:v.nodes.map(n=>n.target)})))}`);
    await page.screenshot({ path: `${output}/login-${locale}-desktop.png`, fullPage: true });
    results.push(`${locale} desktop login rendered`);
  }
  await page.goto(`${base}/ar/login`);
  await page.locator("#email").fill(fixture ? "admin@example.test" : process.env.TEST_EMAIL);
  await page.locator("#password").fill(password);
  await page.locator('button[type="submit"]').click();
  await page.locator(".workspace-root").waitFor({ timeout: 30000 });
  assert((await page.locator(".workspace-profile").innerText()).includes("Admin"), "Expected admin session missing");
  results.push("Fresh admin sign-in succeeded");
  for (const locale of ["ar", "en"]) {
    for (const route of ["", "/students", "/classrooms"]) {
      await page.goto(`${base}/${locale}${route}`);
      await page.locator(".workspace-root").waitFor();
      assert(await page.locator("html").getAttribute("dir") === (locale === "ar" ? "rtl" : "ltr"), "Wrong workspace direction");
      assert(await page.locator("main h1").count() === 1, "Expected one main heading");
      for (const width of [1440, 768, 320]) {
        await page.setViewportSize({ width, height: width === 1440 ? 1000 : 900 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width} ${locale}${route}`);
        const slug = route ? route.slice(1) : "dashboard";
        await page.screenshot({ path: `${output}/${slug}-${locale}-${width}.png`, fullPage: true });
        if (width === 1440 || width === 320) {
          await axe.injectAxe(page);
          const violations = await axe.getViolations(page, undefined, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
          assert(violations.length === 0, `Accessibility violations: ${JSON.stringify(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))}`);
        }
        results.push(`${locale}${route || "/"} at ${width}px, no horizontal overflow`);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/ar`);
  await page.locator('.mobile-navigation a[href="/ar/students"]').click();
  await page.waitForURL("**/ar/students");
  await page.locator('.language-switch').click();
  await page.waitForURL("**/en/students");
  results.push("Mobile module navigation and same-page language switch succeeded");
  const anon = await browser.newContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(`${base}/ar/students`);
  await anonPage.locator("#email").waitFor();
  assert(anonPage.url().includes("login"), "Student page accessible without sign-in");
  results.push("Unauthenticated student page redirects to login");
  for (const locale of ["ar", "en"]) {
    await anonPage.setViewportSize({ width: 320, height: 900 });
    await anonPage.goto(`${base}/${locale}/login`);
    assert(await anonPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Mobile login overflow");
    await anonPage.screenshot({ path: `${output}/login-${locale}-mobile.png`, fullPage: true });
  }
  fs.writeFileSync(`${output}/results.json`, JSON.stringify({ passed: results.length, results }, null, 2));
  console.log(JSON.stringify({ mode: fixture ? "isolated fixture, no live data" : "configured test account", passed: results.length, output, results }, null, 2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  if (server.exitCode === null) await new Promise(resolve => server.once("exit", resolve));
  if (fixture) fs.rmSync(testRoot, { recursive: true, force: true });
  fs.closeSync(log);
  }
