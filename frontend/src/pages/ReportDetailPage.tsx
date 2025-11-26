import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchReportById, updateReportStatus, fetchSummary, deleteReport } from '@/features/reports/reportSlice';
import { StatusBadge } from '@/components/StatusBadge';
import { ReportMap } from '@/components/ReportMap';

const placeholderImg = 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=60';

export const ReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, selected } = useAppSelector((state) => state.reports);
  const { isAdmin } = useAppSelector((state) => state.auth);
  const [deleting, setDeleting] = useState(false);

  const report = useMemo(() => items.find((item) => item.id === Number(id)) ?? selected, [id, items, selected]);

  useEffect(() => {
    if (id && !report) {
      dispatch(fetchReportById(Number(id)));
    }
  }, [dispatch, id, report]);

  if (!id) {
    return null;
  }

  if (!report) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const cover =
    report.pet.mainPhotoUrl ||
    report.photos.find((photo) => photo.isMain)?.photoUrl ||
    report.photos[0]?.photoUrl ||
    placeholderImg;

  const handleStatusChange = async () => {
    const nextStatus = report.status === 'closed' ? 'lost' : 'closed';
    await dispatch(updateReportStatus({ id: report.id, status: nextStatus })).unwrap();
    dispatch(fetchSummary());
  };

  const handleDelete = async () => {
    if (!isAdmin || deleting) return;
    const confirmed = window.confirm('ยืนยันการลบประกาศนี้หรือไม่?');
    if (!confirmed) return;
    try {
      setDeleting(true);
      await dispatch(deleteReport(report.id)).unwrap();
      dispatch(fetchSummary());
      navigate('/');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button className="btn btn-ghost gap-2" onClick={() => navigate(-1)}>
        <ArrowLeftIcon className="h-5 w-5" />
        ย้อนกลับ
      </button>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{report.pet.name}</h1>
              <p className="text-base-content/70">
                {report.pet.species}
                {report.pet.breed ? ` • ${report.pet.breed}` : ''}
              </p>
              <p className="text-base-content/60">
                รายงานเมื่อ {new Date(report.createdAt).toLocaleString('th-TH')} | วันที่หาย{' '}
                {new Date(report.dateLost).toLocaleDateString('th-TH')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={report.status} type={report.reportType} />
              <button className="btn btn-outline btn-sm" onClick={handleStatusChange}>
                เปลี่ยนสถานะเป็น {report.status === 'closed' ? 'ตามหาอยู่' : 'ปิดเคส'}
              </button>
              {isAdmin && (
                <button className="btn btn-error btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'กำลังลบ...' : 'ลบประกาศนี้'}
                </button>
              )}
            </div>
          </div>

          <img src={cover} alt={report.pet.name} className="max-h-[480px] w-full rounded-2xl object-cover" />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">รายละเอียด</h2>
              <p className="whitespace-pre-wrap text-base-content/80">{report.description}</p>

              <div className="rounded-2xl border border-base-200 p-4">
                <p className="font-semibold">ข้อมูลสัตว์เลี้ยง</p>
                <ul className="mt-2 space-y-1 text-sm text-base-content/70">
                  <li>สี: {report.pet.color || '-'}</li>
                  <li>เพศ: {report.pet.sex}</li>
                  <li>อายุ (ปี): {report.pet.ageYears ?? '-'}</li>
                  <li>ไมโครชิป: {report.pet.microchipId || '-'}</li>
                  <li>ลักษณะเด่น: {report.pet.specialMark || '-'}</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl bg-base-200 p-4">
              <div className="flex items-center gap-2 text-base font-semibold">
                <UserIcon className="h-5 w-5" />
                ข้อมูลการติดต่อ
              </div>
              <div className="space-y-1 text-sm">
                <p>ชื่อ: {report.owner.fullName}</p>
                <p>โทร: {report.owner.phone}</p>
                {report.owner.email && <p>อีเมล: {report.owner.email}</p>}
                {report.owner.lineId && <p>Line/อื่น ๆ: {report.owner.lineId}</p>}
              </div>

              <div className="mt-3 flex items-center gap-2 text-base font-semibold">
                <MapPinIcon className="h-5 w-5" />
                ตำแหน่งล่าสุด
              </div>
              <div className="space-y-1 text-sm">
                <p>{report.lastSeenAddress || '-'}</p>
                <p>
                  {report.district || '-'}, {report.province || '-'}
                </p>
                {report.lastSeenLat && report.lastSeenLng && (
                  <p className="text-xs text-base-content/70">
                    Lat/Lng: {report.lastSeenLat}, {report.lastSeenLng}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-base font-semibold">
                <CurrencyDollarIcon className="h-5 w-5" />
                รางวัลนำส่ง
              </div>
              <p className="text-lg font-semibold text-success">{report.rewardAmount?.toLocaleString() || 0} บาท</p>
            </div>
          </div>
        </div>
      </div>

      <ReportMap reports={[report]} />
    </div>
  );
};
