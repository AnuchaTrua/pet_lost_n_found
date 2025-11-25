import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { PetReport } from '@/types/report';
import { defaultIcon } from '@/lib/map';
import { useAppSelector } from '@/app/hooks';

interface Props {
  reports: PetReport[];
}

L.Marker.prototype.options.icon = defaultIcon;

export const ReportMap = ({ reports }: Props) => {
  const { isFormOpen } = useAppSelector((state) => state.ui);
  const markers = reports.filter(
    (report) =>
      report.lastSeenLat !== null &&
      report.lastSeenLat !== undefined &&
      report.lastSeenLng !== null &&
      report.lastSeenLng !== undefined,
  );

  const center = markers.length
    ? ([markers[0].lastSeenLat, markers[0].lastSeenLng] as [number, number])
    : ([13.7563, 100.5018] as [number, number]); // default Bangkok

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Live map</p>
          <h2 className="text-xl font-semibold text-slate-900">แผนที่จุดพบล่าสุด</h2>
        </div>
      </div>
      <div className={`mt-4 h-[420px] overflow-hidden rounded-2xl ${isFormOpen ? 'pointer-events-none opacity-40 blur-[0.5px]' : ''}`}>
        <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((report) => (
            <Marker
              key={report.id}
              position={[report.lastSeenLat as number, report.lastSeenLng as number]}
              title={report.pet.name}
            >
              <Popup>
                <p className="font-semibold">{report.pet.name}</p>
                <p>{report.district}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

