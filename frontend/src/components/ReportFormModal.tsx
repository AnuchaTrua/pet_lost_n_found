import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DocumentTextIcon, MapPinIcon, PhotoIcon, UserIcon, TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeForm } from '@/features/ui/uiSlice';
import { createReport, fetchReports, fetchSummary } from '@/features/reports/reportSlice';

type FormValues = {
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerLineId?: string;
  petName?: string;
  species: string;
  breed?: string;
  color?: string;
  sex: 'male' | 'female' | 'unknown';
  ageYears?: string;
  microchipId?: string;
  specialMark?: string;
  reportType: 'lost' | 'found' | 'sighted';
  status: 'lost' | 'found' | 'closed';
  dateLost: string;
  province: string;
  district: string;
  lastSeenAddress: string;
  lastSeenLat?: string;
  lastSeenLng?: string;
  rewardAmount?: string;
  description?: string;
  photo?: FileList;
};

export const ReportFormModal = () => {
  const dispatch = useAppDispatch();
  const { isFormOpen } = useAppSelector((state) => state.ui);
  const filters = useAppSelector((state) => state.filters);
  const submitStatus = useAppSelector((state) => state.reports.submitStatus);
  const { user, token } = useAppSelector((state) => state.auth);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<
    { displayName: string; lat: string; lon: string; province?: string; district?: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      reportType: 'lost',
      status: 'lost',
      sex: 'unknown',
      dateLost: new Date().toISOString().slice(0, 10),
      province: '',
      district: '',
      lastSeenAddress: '',
    },
  });

  const watchedReportType = watch('reportType');

  useEffect(() => {
    if (watchedReportType === 'found') {
      setValue('status', 'found');
    } else {
      setValue('status', 'lost');
    }
  }, [watchedReportType, setValue]);

  useEffect(() => {
    if (!isFormOpen) {
      reset();
      setSearchText('');
      setSearchResults([]);
      setGeoError(null);
    }
  }, [isFormOpen, reset]);

  useEffect(() => {
    if (isFormOpen && user) {
      setValue('ownerName', user.fullname);
      setValue('ownerPhone', user.phone ?? '');
      setValue('ownerEmail', user.email);
      setValue('ownerLineId', user.lineId ?? '');
    }
  }, [isFormOpen, user, setValue]);

  useEffect(() => {
    if (isFormOpen && (!token || !user)) {
      dispatch(closeForm());
      // eslint-disable-next-line no-alert
      alert('กรุณาเข้าสู่ระบบก่อนโพสต์ประกาศ');
    }
  }, [isFormOpen, token, user, dispatch]);

  useEffect(() => {
    if (searchText.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const fetchPlaces = async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            searchText.trim(),
          )}&addressdetails=1&limit=5&accept-language=th&countrycodes=th`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('ค้นหาสถานที่ไม่สำเร็จ');
        const data: {
          display_name: string;
          lat: string;
          lon: string;
          address?: Record<string, string>;
        }[] = await response.json();
        const mapped = data.map((item) => ({
          displayName: item.display_name,
          lat: item.lat,
          lon: item.lon,
          province:
            item.address?.state ||
            item.address?.province ||
            item.address?.region ||
            item.address?.state_district,
          district:
            item.address?.suburb ||
            item.address?.district ||
            item.address?.county ||
            item.address?.borough ||
            item.address?.city ||
            item.address?.town ||
            item.address?.village,
        }));
        setSearchResults(mapped);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchPlaces();
    return () => controller.abort();
  }, [searchText]);

  const handleSelectPlace = (place: {
    displayName: string;
    lat: string;
    lon: string;
    province?: string;
    district?: string;
  }) => {
    setValue('lastSeenAddress', place.displayName);
    if (place.province) setValue('province', place.province);
    if (place.district) setValue('district', place.district);
    setValue('lastSeenLat', place.lat);
    setValue('lastSeenLng', place.lon);
    setSearchResults([]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง');
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('lastSeenLat', latitude.toFixed(6));
        setValue('lastSeenLng', longitude.toFixed(6));
      },
      (error) => {
        setGeoError(error.message === 'User denied Geolocation' ? 'ผู้ใช้ปฏิเสธการเข้าถึงตำแหน่ง' : error.message);
      },
      { enableHighAccuracy: true },
    );
  };

  const onSubmit = async (values: FormValues) => {
    if (!user || !token) return;
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'photo' && value instanceof FileList && value.length) {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value as string);
      }
    });

    try {
      await dispatch(createReport(formData)).unwrap();
      dispatch(fetchReports(filters));
      dispatch(fetchSummary());
      dispatch(closeForm());
    } catch (error) {
      console.error(error);
    }
  };

  if (!isFormOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-base-content/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 px-6 py-5">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-base-content/60">Pet Alert</p>
              <h2 className="text-2xl font-semibold text-base-content">แจ้งสัตว์เลี้ยงหาย / พบสัตว์จร</h2>
              <p className="text-sm text-base-content/70">กรอกข้อมูลให้ครบถ้วนเพื่อช่วยให้ชุมชนตามหาได้ไวขึ้น</p>
            </div>
            <button type="button" className="btn btn-circle btn-ghost" onClick={() => dispatch(closeForm())}>
              ✕
            </button>
          </div>

          <div className="max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <section className="rounded-2xl border border-base-200 p-4 shadow-sm">
                <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/70">
                  <DocumentTextIcon className="h-5 w-5 text-primary" />
                  รายละเอียดประกาศ
                </header>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="form-control">
                    <span className="label-text">ประเภทประกาศ*</span>
                    <select className="select select-bordered" {...register('reportType', { required: true })}>
                      <option value="lost">สัตว์เลี้ยงหาย</option>
                      <option value="found">พบสัตว์จร</option>
                      <option value="sighted">พบเห็น / Sighted</option>
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text">วันที่หาย / พบ*</span>
                    <input type="date" className="input input-bordered" {...register('dateLost', { required: true })} />
                    {errors.dateLost && <span className="text-error text-sm">จำเป็นต้องกรอกวันที่</span>}
                  </label>
                  {watchedReportType === 'lost' && (
                    <label className="form-control">
                      <span className="label-text">รางวัลนำส่ง (บาท)</span>
                      <input className="input input-bordered" type="number" step="0.01" {...register('rewardAmount')} />
                    </label>
                  )}
                </div>
                <label className="form-control mt-4">
                  <span className="label-text">รายละเอียดเพิ่มเติม</span>
                  <textarea className="textarea textarea-bordered" rows={4} {...register('description')} />
                </label>
              </section>

              <section className="rounded-2xl border border-base-200 p-4 shadow-sm">
                <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/70">
                  <TagIcon className="h-5 w-5 text-secondary" />
                  ข้อมูลสัตว์เลี้ยง
                </header>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">ชื่อสัตว์เลี้ยง{watchedReportType === 'lost' && '*'}</span>
                    <input
                      className="input input-bordered"
                      {...register('petName', { required: watchedReportType === 'lost' })}
                    />
                    {errors.petName && watchedReportType === 'lost' && (
                      <span className="text-error text-sm">จำเป็นต้องกรอก</span>
                    )}
                  </label>
                  <label className="form-control">
                    <span className="label-text">ชนิดสัตว์*</span>
                    <input className="input input-bordered" {...register('species', { required: true })} />
                    {errors.species && <span className="text-error text-sm">จำเป็นต้องกรอก</span>}
                  </label>
                  <label className="form-control">
                    <span className="label-text">สายพันธุ์</span>
                    <input className="input input-bordered" {...register('breed')} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">สี</span>
                    <input className="input input-bordered" {...register('color')} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">เพศ</span>
                    <select className="select select-bordered" {...register('sex')}>
                      <option value="unknown">ไม่ทราบ</option>
                      <option value="male">ผู้</option>
                      <option value="female">เมีย</option>
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text">อายุ (ปี)</span>
                    <input className="input input-bordered" type="number" step="0.1" {...register('ageYears')} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">ไมโครชิป</span>
                    <input className="input input-bordered" {...register('microchipId')} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">ลักษณะเด่น</span>
                    <input className="input input-bordered" {...register('specialMark')} />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-base-200 p-4 shadow-sm">
                <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/70">
                  <MapPinIcon className="h-5 w-5 text-secondary" />
                  รายละเอียดสถานที่
                </header>
                <div className="mt-3 grid gap-3 rounded-xl border border-base-200 bg-base-200/40 p-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-base-content/80">ค้นหาด้วยชื่อสถานที่</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          className="input input-bordered w-full pr-10"
                          placeholder="เช่น Central World, BTS Siam, สวนลุม"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={isSearching}
                        onClick={() => setSearchText((prev) => prev.trim())}
                      >
                        {isSearching ? <span className="loading loading-spinner loading-sm" /> : 'ค้นหา'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={handleUseCurrentLocation}>
                        ใช้ตำแหน่งปัจจุบัน
                      </button>
                    </div>
                    {geoError && <p className="text-sm text-error">{geoError}</p>}
                    {searchResults.length > 0 && (
                      <ul className="max-h-40 overflow-y-auto rounded-lg border border-base-200 bg-white shadow-sm">
                        {searchResults.map((place) => (
                          <li
                            key={`${place.lat}-${place.lon}-${place.displayName}`}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-base-200"
                            onClick={() => handleSelectPlace(place)}
                          >
                            <p className="font-medium text-base-content">{place.displayName}</p>
                            <p className="text-xs text-base-content/70">
                              {place.district ?? ''} {place.province ?? ''}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">จังหวัด*</span>
                    <input className="input input-bordered" {...register('province', { required: true })} />
                    {errors.province && <span className="text-error text-sm">จำเป็นต้องกรอก</span>}
                  </label>
                  <label className="form-control">
                    <span className="label-text">เขต/อำเภอ*</span>
                    <input className="input input-bordered" {...register('district', { required: true })} />
                    {errors.district && <span className="text-error text-sm">จำเป็นต้องกรอก</span>}
                  </label>
                  <label className="form-control md:col-span-2">
                    <span className="label-text">ที่อยู่โดยละเอียด*</span>
                    <input className="input input-bordered" {...register('lastSeenAddress', { required: true })} />
                    {errors.lastSeenAddress && <span className="text-error text-sm">จำเป็นต้องกรอก</span>}
                  </label>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">ละติจูด (ถ้ามี)</span>
                    <input className="input input-bordered" type="number" step="any" {...register('lastSeenLat')} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">ลองจิจูด (ถ้ามี)</span>
                    <input className="input input-bordered" type="number" step="any" {...register('lastSeenLng')} />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-base-200 p-4 shadow-sm">
                <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/70">
                  <UserIcon className="h-5 w-5 text-primary" />
                  ช่องทางติดต่อ
                </header>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">ชื่อผู้ติดต่อ</span>
                    <input className="input input-bordered" {...register('ownerName')} readOnly={Boolean(user)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">เบอร์โทร</span>
                    <input className="input input-bordered" {...register('ownerPhone')} readOnly={Boolean(user)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">อีเมล</span>
                    <input className="input input-bordered" type="email" {...register('ownerEmail')} readOnly={Boolean(user)} />
                  </label>
                  <label className="form-control md:col-span-2">
                    <span className="label-text">Line / ช่องทางเพิ่มเติม</span>
                    <input className="input input-bordered" {...register('ownerLineId')} readOnly={Boolean(user)} />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-dashed border-base-300 p-4 shadow-sm">
                <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/70">
                  <PhotoIcon className="h-5 w-5 text-secondary" />
                  รูปภาพประกาศ
                </header>
                <div className="mt-4 space-y-2">
                  <input type="file" accept="image/*" className="file-input file-input-bordered w-full" {...register('photo')} />
                  <p className="text-xs text-base-content/70">รองรับ JPG / PNG / WEBP ขนาดไม่เกิน 5 MB</p>
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" className="btn btn-ghost" onClick={() => dispatch(closeForm())}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary px-8" disabled={submitStatus === 'loading'}>
                  {submitStatus === 'loading' ? <span className="loading loading-spinner" /> : 'บันทึกประกาศ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
