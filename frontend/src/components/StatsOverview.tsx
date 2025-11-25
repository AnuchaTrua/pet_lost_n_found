import { SummaryStats } from '@/types/report';

interface Props {
  stats: SummaryStats | null;
  loading: boolean;
}

const cards = [
  { key: 'total', label: 'ทั้งหมด', color: 'bg-primary/10 text-primary' },
  { key: 'lost', label: 'สัตว์เลี้ยงหาย', color: 'bg-warning/10 text-warning' },
  { key: 'found', label: 'พบสัตว์จร', color: 'bg-info/10 text-info' },
  { key: 'sighted', label: 'พบเห็น', color: 'bg-violet-100 text-violet-700' },
  { key: 'closed', label: 'ปิดเคสแล้ว', color: 'bg-success/10 text-success' },
] as const;

export const StatsOverview = ({ stats, loading }: Props) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.key}
          className="flex h-36 flex-col justify-between rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-lg backdrop-blur-md"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
          <div className={`text-4xl font-semibold ${card.color}`}>
            {loading ? <span className="loading loading-ring text-primary" /> : stats?.[card.key] ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
};

