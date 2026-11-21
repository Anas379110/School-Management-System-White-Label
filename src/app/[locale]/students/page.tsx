import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus, Users, ChevronRight } from "lucide-react";
import { requireSession } from "@/lib/session";
import { listStudents, listStudentsForGuardian } from "@/modules/academic/service";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";
import { localizedPath } from "@/modules/dashboard/navigation";

export default async function StudentsPage() {
  const session = await requireSession(["ADMIN", "TEACHER", "PARENT", "ACCOUNTANT"]);
  const t = await getTranslations("students");
  const ui = await getTranslations("workspace");
  const locale = await getLocale();
  const settings = await getSchoolSettings();
  const role = session.user.role;
  const students = role === "PARENT" ? await listStudentsForGuardian(session.user.id) : (await listStudents({ page: 1, limit: 50 })).items;
  const canAdd = role === "ADMIN";
  const addLink = <Link href={localizedPath(locale, "/students/new")} className="page-action"><Plus className="h-4 w-4" aria-hidden="true" />{t("addStudent")}</Link>;

  return (
    <WorkspaceShell active="students" role={role} userName={session.user.name ?? ""} schoolName={settings.schoolName} title={t("title")}>
      <div className="page-title-row"><div><p className="section-kicker">{ui("workspace")}</p><h1>{t("title")}</h1><p>{ui("studentsSubtitle")}</p></div>{canAdd && addLink}</div>
      <section className="content-panel" aria-labelledby="student-directory-title">
        <div className="content-panel-header"><h2 id="student-directory-title">{ui("studentList")}</h2><Users className="h-5 w-5 text-slate-400" aria-hidden="true" /></div>
        {students.length === 0 ? (
          <div className="empty-state"><span className="empty-icon"><Users className="h-9 w-9" strokeWidth={1.3} aria-hidden="true" /></span><h2>{canAdd ? ui("studentEmptyTitle") : t("emptyState")}</h2>{canAdd && <><p>{ui("studentEmptyDescription")}</p>{addLink}</>}</div>
        ) : (
          <ul className="workspace-list">{students.map(student => <li key={student.id} className="workspace-list-row"><div className="workspace-list-name"><span className="workspace-list-avatar" aria-hidden="true">{student.fullName.charAt(0)}</span><span className="font-semibold">{student.fullName}</span><StatusBadge status={student.status as "active" | "archived"} activeLabel={t("statusActive")} archivedLabel={t("statusArchived")} /></div><Link href={localizedPath(locale, `/students/${student.id}`)}>{t("viewDetails")}<ChevronRight className="directional-icon ms-1 h-4 w-4" aria-hidden="true" /></Link></li>)}</ul>
        )}
      </section>
    </WorkspaceShell>
  );
}
