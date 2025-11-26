import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyReports } from '@/features/reports/reportSlice';
import { ReportCard } from '@/components/ReportCard';
import { openForm } from '@/features/ui/uiSlice';

export const MyReportsPage = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { mine, mineLoading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    if (user && token) {
      dispatch(fetchMyReports());
    }
  }, [dispatch, user, token]);

  if (!user || !token) {
    return (
      <div className="glass-panel space-y-4 p-8 text-center">
        <p className="text-lg font-semibold text-base-content">กรุณาเข้าสู่ระบบเพื่อดูโพสต์ของคุณ</p>
        <p className="text-sm text-base-content/70">ใช้ปุ่มเข้าสู่ระบบที่มุมขวาบน แล้วกลับมาหน้านี้อีกครั้ง</p>
        <Link to="/" className="btn btn-primary">
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  if (mineLoading) {
    return (
      <div className="glass-panel flex items-center justify-center py-16">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label">บัญชีของฉัน</p>
          <h1 className="text-2xl font-semibold text-base-content">ประกาศของ {user.fullname}</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            dispatch(openForm());
          }}
        >
          สร้างประกาศใหม่
        </button>
      </div>

      {!mine.length ? (
        <div className="glass-panel space-y-3 px-8 py-12 text-center">
          <p className="text-xl font-semibold text-base-content">ยังไม่มีประกาศของคุณ</p>
          <p className="text-base-content/70">เริ่มโพสต์ประกาศแรกของคุณได้เลย</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mine.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};
