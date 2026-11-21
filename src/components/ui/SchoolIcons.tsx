import { Bell, BookOpen, CalendarCheck, ClipboardCheck, GraduationCap, LayoutDashboard, LibraryBig, Users, Wallet } from "lucide-react";
import type { WorkspaceSection } from "@/modules/dashboard/navigation";

const icons = {
  home: LayoutDashboard,
  students: Users,
  classrooms: LibraryBig,
  attendance: CalendarCheck,
  grades: ClipboardCheck,
  finance: Wallet,
  notifications: Bell,
};

export function SectionIcon({ section, className = "" }: { section: WorkspaceSection; className?: string }) {
  const Icon = icons[section];
  return <Icon aria-hidden="true" strokeWidth={1.7} className={className} />;
}

export function SchoolMark({ className = "" }: { className?: string }) {
  return <GraduationCap aria-hidden="true" strokeWidth={1.7} className={className} />;
}

/** Original decorative SVG. No stock images, remote assets, or student likenesses. */
export function LearningIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`learning-illustration ${className}`} aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="spark spark-one" />
      <span className="spark spark-two" />
      <div className="illustration-book"><BookOpen strokeWidth={1.1} /></div>
      <div className="illustration-cap"><GraduationCap strokeWidth={1.4} /></div>
      <div className="illustration-check"><ClipboardCheck strokeWidth={1.5} /></div>
    </div>
  );
}
