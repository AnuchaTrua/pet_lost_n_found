import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setFilters, resetFilters } from '@/features/filters/filterSlice';
import { openForm } from '@/features/ui/uiSlice';
import { ReportFilters } from '@/types/report';

const speciesOptions = ['สุนัข', 'แมว', 'นก', 'อื่น ๆ'];

export const FiltersPanel = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const { user, token } = useAppSelector((state) => state.auth);
  const isAuthenticated = Boolean(user && token);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const nextValues: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string') {
        nextValues[key] = value as string;
      }
    });
    setFormValues(nextValues);
  }, [filters]);

  const handleChange = (key: Exclude<keyof ReportFilters, 'userId'>, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setFormValues({});
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitized = Object.entries(formValues).reduce<ReportFilters>((acc, [key, value]) => {
      if (value && value !== '') {
        if (key === 'status' && (value === 'lost' || value === 'found' || value === 'closed')) {
          acc.status = value;
        } else if (key === 'reportType' && (value === 'lost' || value === 'found' || value === 'sighted')) {
          acc.reportType = value;
        } else {
          acc[key as Exclude<keyof ReportFilters, 'status' | 'reportType' | 'userId'>] = value;
        }
      }
      return acc;
    }, {});
    dispatch(setFilters(sanitized));
  };

  return (
    <aside className="glass-panel sticky top-24 max-h-[80vh] overflow-y-auto p-6">
      <form className="space-y-5" onSubmit={handleSearch}>
        <div className="space-y-1">
          <p className="section-label">Filters</p>
          <h2 className="text-xl font-semibold text-slate-900">ค้นหาในพื้นที่</h2>
          <p className="text-sm text-slate-500">กรอกอย่างน้อยหนึ่งช่องเพื่อจำกัดผลลัพธ์ให้ตรงจุด</p>
        </div>

        <label className="form-control w-full">
          <span className="label-text">คำค้น (ชื่อสัตว์ / รายละเอียด)</span>
          <input
            type="text"
            placeholder="เช่น โกลเด้น, ปลอกคอสีแดง"
            className="input input-bordered"
            value={formValues.search ?? ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">จังหวัด</span>
          <input
            type="text"
            className="input input-bordered"
            value={formValues.province ?? ''}
            onChange={(e) => handleChange('province', e.target.value)}
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">เขต/อำเภอ</span>
          <input
            type="text"
            className="input input-bordered"
            value={formValues.district ?? ''}
            onChange={(e) => handleChange('district', e.target.value)}
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">ชนิดสัตว์</span>
          <select
            className="select select-bordered"
            value={formValues.species ?? ''}
            onChange={(e) => handleChange('species', e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {speciesOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">สถานะ</span>
            <select
              className="select select-bordered"
              value={formValues.status ?? ''}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              <option value="lost">ตามหาอยู่</option>
              <option value="found">พบเจอแล้ว</option>
              <option value="closed">ปิดเคส</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">ประเภทแจ้ง</span>
            <select
              className="select select-bordered"
              value={formValues.reportType ?? ''}
              onChange={(e) => handleChange('reportType', e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              <option value="lost">สัตว์เลี้ยงหาย</option>
              <option value="found">พบสัตว์จร</option>
              <option value="sighted">เห็น/พบเห็น</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary flex-1">
            ค้นหา
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            ล้างค่า
          </button>
        </div>

        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary">ร่วมช่วยกันแจ้งเบาะแส</p>
          <p className="text-xs text-primary/80">โพสต์สัตว์เลี้ยงหายหรือพบสัตว์จร คลิกปุ่มด้านล่างได้เลย</p>
          <button
            type="button"
            className="btn btn-secondary mt-4 w-full"
            onClick={() => {
              if (!isAuthenticated) {
                // eslint-disable-next-line no-alert
                alert('กรุณาเข้าสู่ระบบก่อนโพสต์ประกาศ');
                return;
              }
              dispatch(openForm());
            }}
          >
            แจ้งสัตว์เลี้ยงหาย / พบสัตว์จร
          </button>
        </div>
      </form>
    </aside>
  );
};
