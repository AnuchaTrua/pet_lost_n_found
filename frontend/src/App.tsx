import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ReportDetailPage } from '@/pages/ReportDetailPage';
import { MainLayout } from '@/layouts/MainLayout';
import { MyReportsPage } from '@/pages/MyReportsPage';
import { RegisterPage } from '@/pages/RegisterPage';

export const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};
