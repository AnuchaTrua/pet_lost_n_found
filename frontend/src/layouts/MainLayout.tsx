import { Link, NavLink } from 'react-router-dom';
import { AdminAccess } from '@/components/AdminAccess';

interface Props {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sky-50">
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-[0.3em] text-slate-900">
            PET ALERT TH
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <nav className="flex gap-6">
              <NavLink to="/" className={({ isActive }) => (isActive ? 'text-primary' : '')}>
                หน้าหลัก
              </NavLink>
              <a href="https://www.openstreetmap.org/copyright" className="hover:text-primary" target="_blank" rel="noreferrer">
                ข้อมูลแผนที่
              </a>
            </nav>
            <AdminAccess />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <footer className="px-4 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Pet Alert TH · Community-powered missing pet alerts
      </footer>
    </div>
  );
};
