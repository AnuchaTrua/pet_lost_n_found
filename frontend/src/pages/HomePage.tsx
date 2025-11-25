import { useEffect } from 'react';
import { FiltersPanel } from '@/components/FiltersPanel';
import { ReportFormModal } from '@/components/ReportFormModal';
import { ReportList } from '@/components/ReportList';
import { ReportMap } from '@/components/ReportMap';
import { StatsOverview } from '@/components/StatsOverview';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchReports, fetchSummary } from '@/features/reports/reportSlice';

export const HomePage = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const { items, loading, summary, summaryLoading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchReports(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(fetchSummary());
  }, [dispatch]);

  return (
    <div className="space-y-10">
      <section className="glass-panel relative overflow-hidden p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="section-label">Community SOS</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">ตามหาเพื่อนรักให้กลับบ้าน</h1>
            <p className="text-base text-slate-600">
              รวมเบาะแสสัตว์เลี้ยงหายและสัตว์จรในพื้นที่ ช่วยกันแชร์และแจ้งข้อมูลได้ในไม่กี่คลิก พร้อมแผนที่และช่องทางติดต่อครบถ้วน
            </p>
            <div className="flex flex-wrap gap-4">
              <a className="btn btn-primary px-8" href="#explore">
                เริ่มสำรวจ
              </a>
              <a className="btn btn-outline" href="#how-it-works">
                วิธีการทำงาน
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-inner backdrop-blur">
            <StatsOverview stats={summary} loading={summaryLoading} />
          </div>
        </div>
        <span className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10" />
      </section>

      <div className="grid gap-8 lg:grid-cols-[360px,1fr]" id="explore">
        <FiltersPanel />
        <div className="space-y-6">
          <ReportMap reports={items} />
          <ReportList reports={items} loading={loading} />
        </div>
      </div>
      <ReportFormModal />
    </div>
  );
};

