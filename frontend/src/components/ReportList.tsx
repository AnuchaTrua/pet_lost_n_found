import { PetReport } from '@/types/report';
import { ReportCard } from './ReportCard';

interface Props {
  reports: PetReport[];
  loading: boolean;
}

export const ReportList = ({ reports, loading }: Props) => {
  if (loading) {
    return (
      <div className="glass-panel flex items-center justify-center py-16">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="glass-panel space-y-3 px-8 py-12 text-center">
        <p className="text-xl font-semibold text-slate-900">ยังไม่มีข้อมูลในพื้นที่นี้</p>
        <p className="text-slate-500">เป็นคนแรกที่แจ้งเบาะแสให้เพื่อน ๆ ในชุมชนได้เลย</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
};

