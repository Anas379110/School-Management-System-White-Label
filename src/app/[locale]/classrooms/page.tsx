import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LibraryBig, ChevronRight } from "lucide-react";
import { requireSession } from "@/lib/session";
import { listClassRooms } from "@/modules/academic/service";
import { CreateClassRoomForm } from "@/modules/academic/CreateClassRoomForm";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";
import { localizedPath } from "@/modules/dashboard/navigation";

export default async function ClassRoomsPage() {
  const session = await requireSession(["ADMIN", "TEACHER"]);
  const t = await getTranslations("classrooms");
  const ui = await getTranslations("workspace");
  const locale = await getLocale();
  const settings = await getSchoolSettings();
  const classRooms = await listClassRooms();
  const canAdd = session.user.role === "ADMIN";

  return (
    <WorkspaceShell active="classrooms" role={session.user.role} userName={session.user.name ?? ""} schoolName={settings.schoolName} title={t("title")}>
      <div className="page-title-row"><div><p className="section-kicker">{ui("workspace")}</p><h1>{t("title")}</h1><p>{ui("classroomsSubtitle")}</p></div></div>
      {canAdd && <section className="classroom-form-panel" aria-label={t("addClassRoom")}><CreateClassRoomForm /></section>}
      <section className="content-panel" aria-labelledby="classroom-list-title">
        <div className="content-panel-header"><h2 id="classroom-list-title">{ui("classroomList")}</h2><LibraryBig className="h-5 w-5 text-slate-400" aria-hidden="true" /></div>
        {classRooms.length === 0 ? (
          <div className="empty-state"><span className="empty-icon"><LibraryBig className="h-9 w-9" strokeWidth={1.3} aria-hidden="true" /></span><h2>{ui("classroomEmptyTitle")}</h2><p>{canAdd ? ui("classroomEmptyDescription") : t("emptyState")}</p></div>
        ) : (
          <ul className="workspace-list">{classRooms.map(classRoom => <li key={classRoom.id}><Link href={localizedPath(locale, `/classrooms/${classRoom.id}`)} className="workspace-list-row hover:bg-slate-50"><span className="workspace-list-name"><span className="workspace-list-avatar"><LibraryBig className="h-5 w-5" aria-hidden="true" /></span><span className="font-semibold">{classRoom.name}</span></span><span className="flex items-center gap-3 text-slate-500"><span>{classRoom.academicYear}</span><ChevronRight className="directional-icon h-4 w-4" aria-hidden="true" /></span></Link></li>)}</ul>
        )}
      </section>
    </WorkspaceShell>
  );
}
