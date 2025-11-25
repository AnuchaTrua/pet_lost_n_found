import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, PhoneIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { PetReport } from '@/types/report';
import { StatusBadge } from './StatusBadge';

interface Props {
  report: PetReport;
}

const placeholderImg = 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=60';

export const ReportCard = ({ report }: Props) => {
  const date = new Date(report.createdAt).toLocaleString('th-TH');
  const cover =
    report.pet.mainPhotoUrl ||
    report.photos.find((photo) => photo.isMain)?.photoUrl ||
    report.photos[0]?.photoUrl ||
    placeholderImg;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={cover}
          alt={report.pet.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 text-white drop-shadow">
          <StatusBadge status={report.status} type={report.reportType} />
          <h3 className="text-lg font-semibold">
            {report.pet.name} ({report.pet.species})
          </h3>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm text-slate-600 line-clamp-3">{report.description}</p>
        <div className="space-y-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-secondary" />
            <span>
              {report.district || '-'}, {report.province || '-'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-secondary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCircleIcon className="h-4 w-4 text-secondary" />
            <span>{report.owner.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-secondary" />
            <span>{report.owner.phone}</span>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to={`/reports/${report.id}`} className="btn btn-sm btn-primary px-6">
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </article>
  );
};

