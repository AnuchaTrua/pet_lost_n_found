import { FormEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { adminLogin, clearError, logout } from '@/features/auth/authSlice';

export const AdminAccess = () => {
  const dispatch = useAppDispatch();
  const { isAdmin, status, error } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAdmin) {
      setOpen(false);
      setUsername('');
      setPassword('');
    }
  }, [isAdmin]);

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
    dispatch(adminLogin({ username, password }));
  };

  if (isAdmin) {
    return (
      <div className="flex items-center gap-3 text-xs font-semibold text-primary">
        <span className="rounded-full bg-primary/10 px-3 py-1">ADMIN MODE</span>
        <button className="btn btn-xs btn-ghost" onClick={() => dispatch(logout())}>
          ออกจากระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button className="btn btn-sm btn-ghost" onClick={toggle}>
        Admin
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-base-200 bg-white p-4 text-sm shadow-xl"
        >
          <p className="mb-2 text-xs font-semibold text-base-content/70">เข้าสู่ระบบผู้ดูแล</p>
          <div className="space-y-2">
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <input
              type="password"
              className="input input-bordered input-sm w-full"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="text-xs text-error">{error}</p>}
            <button className="btn btn-primary btn-sm w-full" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
