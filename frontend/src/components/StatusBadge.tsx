import { ReportStatus, ReportType } from '@/types/report';

interface Props {
  status: ReportStatus;
  type: ReportType;
}

const statusMeta: Record<ReportStatus, { label: string; className: string }> = {
  lost: { label: 'ตามหาอยู่', className: 'bg-amber-100 text-amber-700' },
  found: { label: 'พบแล้ว', className: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'ปิดเคส', className: 'bg-slate-200 text-slate-800' },
};

const typeMeta: Record<ReportType, { label: string; className: string }> = {
  lost: { label: 'แจ้งสัตว์เลี้ยงหาย', className: 'bg-indigo-100 text-indigo-700' },
  found: { label: 'แจ้งพบสัตว์จร', className: 'bg-sky-100 text-sky-700' },
  sighted: { label: 'แจ้งพบเห็น', className: 'bg-violet-100 text-violet-700' },
};

export const StatusBadge = ({ status, type }: Props) => {
  const statusInfo = statusMeta[status];
  const typeInfo = typeMeta[type];

  return (
    <div className="flex flex-wrap gap-2 text-xs font-semibold">
      <span className={`rounded-full px-3 py-1 ${statusInfo.className}`}>{statusInfo.label}</span>
      <span className={`rounded-full px-3 py-1 ${typeInfo.className}`}>{typeInfo.label}</span>
    </div>
  );
};

