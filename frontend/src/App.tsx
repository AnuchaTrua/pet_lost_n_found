import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ReportDetailPage } from '@/pages/ReportDetailPage';
import { MainLayout } from '@/layouts/MainLayout';

export const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

