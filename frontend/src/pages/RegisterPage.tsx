import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register } from '@/features/auth/authSlice';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(register({ fullname, email, password, phone, lineId })).unwrap();
    if (result.token) {
      navigate('/my-reports');
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-base-200 bg-base-100 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-base-content">สมัครสมาชิก</h1>
      <p className="text-sm text-base-content/70">สมัครเป็นผู้ใช้ทั่วไป (role user) เพื่อโพสต์และจัดการประกาศของตัวเอง</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="form-control">
          <span className="label-text">ชื่อ-นามสกุล</span>
          <input className="input input-bordered" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
        </label>
        <label className="form-control">
          <span className="label-text">อีเมล</span>
          <input
            className="input input-bordered"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text">รหัสผ่าน (6-16 ตัวอักษร)</span>
          <input
            className="input input-bordered"
            type="password"
            value={password}
            minLength={6}
            maxLength={16}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text">เบอร์โทร (ถ้ามี)</span>
          <input className="input input-bordered" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} />
        </label>
        <label className="form-control">
          <span className="label-text">Line ID / ช่องทางเพิ่มเติม (ถ้ามี)</span>
          <input className="input input-bordered" value={lineId} onChange={(e) => setLineId(e.target.value)} maxLength={45} />
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <button className="btn btn-primary w-full" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-base-content/70">
        มีบัญชีแล้ว?{' '}
        <Link to="/" className="link link-primary">
          กลับหน้าหลักเพื่อเข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
};
