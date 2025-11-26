import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, UserIcon, CurrencyDollarIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchReportById,
  updateReportStatus,
  fetchSummary,
  deleteReport,
  updateReportDetails,
} from '@/features/reports/reportSlice';
import { StatusBadge } from '@/components/StatusBadge';
import { ReportMap } from '@/components/ReportMap';

const placeholderImg = 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=60';

export const ReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, selected } = useAppSelector((state) => state.reports);
  const { user } = useAppSelector((state) => state.auth);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    petName: '',
    species: '',
    breed: '',
    color: '',
    sex: 'unknown',
    dateLost: '',
    province: '',
    district: '',
    lastSeenAddress: '',
    rewardAmount: '',
    description: '',
  });

  const report = useMemo(() => items.find((item) => item.id === Number(id)) ?? selected, [id, items, selected]);
  const isOwner = report && user ? report.userId === user.id : false;
  const isAdmin = user?.role === 'admin';

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

  useEffect(() => {
    if (report) {
      setForm({
        petName: report.pet.name || '',
        species: report.pet.species || '',
        breed: report.pet.breed || '',
        color: report.pet.color || '',
        sex: report.pet.sex,
        dateLost: report.dateLost.slice(0, 10),
        province: report.province || '',
        district: report.district || '',
        lastSeenAddress: report.lastSeenAddress || '',
        rewardAmount: report.rewardAmount?.toString() || '',
        description: report.description || '',
      });
    }
  }, [report]);

  const handleStatusChange = async () => {
    if (!isOwner && !isAdmin) return;
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

  const handleEditSubmit = async () => {
    if (!report || (!isOwner && !isAdmin)) return;
    await dispatch(
      updateReportDetails({
        id: report.id,
        payload: {
          ...report,
          reportType: report.reportType,
          status: report.status,
          dateLost: form.dateLost,
          province: form.province,
          district: form.district,
          lastSeenAddress: form.lastSeenAddress,
          rewardAmount: Number(form.rewardAmount) || 0,
          description: form.description,
          pet: {
            ...report.pet,
            name: form.petName,
            species: form.species,
            breed: form.breed,
            color: form.color,
            sex: form.sex as typeof report.pet.sex,
          },
        },
      }),
    ).unwrap();
    setEditing(false);
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
              {(isOwner || isAdmin) && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button className="btn btn-outline btn-sm" onClick={handleStatusChange}>
                    เปลี่ยนสถานะเป็น {report.status === 'closed' ? 'ตามหาอยู่' : 'ปิดเคส'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing((prev) => !prev)}>
                    <PencilSquareIcon className="h-4 w-4" />
                    แก้ไขประกาศ
                  </button>
                </div>
              )}
              {isAdmin && (
                <button className="btn btn-error btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'กำลังลบ...' : 'ลบประกาศนี้'}
                </button>
              )}
            </div>
          </div>

          <img src={cover} alt={report.pet.name} className="max-h-[480px] w-full rounded-2xl object-cover" />

          {editing && (isOwner || isAdmin) && (
            <div className="rounded-2xl border border-base-300 p-4 space-y-3">
              <p className="text-lg font-semibold">แก้ไขประกาศ</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="form-control">
                  <span className="label-text">ชื่อสัตว์เลี้ยง</span>
                  <input className="input input-bordered" value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} />
                </label>
                <label className="form-control">
                  <span className="label-text">ชนิด</span>
                  <input className="input input-bordered" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} />
                </label>
                <label className="form-control">
                  <span className="label-text">สายพันธุ์</span>
                  <input className="input input-bordered" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
                </label>
                <label className="form-control">
                  <span className="label-text">สี</span>
                  <input className="input input-bordered" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </label>
                <label className="form-control">
                  <span className="label-text">เพศ</span>
                  <select
                    className="select select-bordered"
                    value={form.sex}
                    onChange={(e) => setForm({ ...form, sex: e.target.value })}
                  >
                    <option value="male">male</option>
                    <option value="female">female</option>
                    <option value="unknown">unknown</option>
                  </select>
                </label>
                <label className="form-control">
                  <span className="label-text">วันที่หาย/พบ</span>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={form.dateLost}
                    onChange={(e) => setForm({ ...form, dateLost: e.target.value })}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text">จังหวัด</span>
                  <input className="input input-bordered" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
                </label>
                <label className="form-control">
                  <span className="label-text">อำเภอ</span>
                  <input className="input input-bordered" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                </label>
                <label className="form-control md:col-span-2">
                  <span className="label-text">ที่อยู่/จุดพบ</span>
                  <input
                    className="input input-bordered"
                    value={form.lastSeenAddress}
                    onChange={(e) => setForm({ ...form, lastSeenAddress: e.target.value })}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text">รางวัลนำส่ง</span>
                  <input
                    className="input input-bordered"
                    type="number"
                    value={form.rewardAmount}
                    onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })}
                  />
                </label>
              </div>
              <label className="form-control">
                <span className="label-text">รายละเอียด</span>
                <textarea
                  className="textarea textarea-bordered"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                  ยกเลิก
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleEditSubmit}>
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          )}

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
