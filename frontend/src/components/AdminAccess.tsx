import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearError, login, logout } from '@/features/auth/authSlice';

export const AdminAccess = () => {
  const dispatch = useAppDispatch();
  const { user, token, status, error } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAuthenticated) {
      setOpen(false);
      setEmail('');
      setPassword('');
    }
  }, [isAuthenticated]);

  const toggle = () => {
    setOpen((prev) => {
      if (!prev) {
        dispatch(clearError());
      }
      return !prev;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(login({ email, password }));
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3 text-xs font-semibold text-primary">
        <span className="rounded-full bg-primary/10 px-3 py-1">
          {isAdmin ? 'ADMIN' : 'USER'} · {user.fullname}
        </span>
        <Link to="/my-reports" className="btn btn-xs btn-outline">
          โพสต์ของฉัน
        </Link>
        <button className="btn btn-xs btn-ghost" onClick={() => dispatch(logout())}>
          ออกจากระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button className="btn btn-sm btn-ghost" onClick={toggle}>
        เข้าสู่ระบบ
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-base-200 bg-white p-4 text-sm shadow-xl"
        >
          <p className="mb-2 text-xs font-semibold text-base-content/70">เข้าสู่ระบบ</p>
          <div className="space-y-2">
            <input
              type="email"
              className="input input-bordered input-sm w-full"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              type="password"
              className="input input-bordered input-sm w-full"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <p className="text-xs text-error">{error}</p>}
            <button className="btn btn-primary btn-sm w-full" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
            <Link to="/register" className="btn btn-ghost btn-xs w-full text-center">
              สมัครสมาชิก
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
