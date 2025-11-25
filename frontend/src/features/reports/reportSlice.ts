import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { PetReport, ReportFilters, ReportStatus, SummaryStats } from '@/types/report';

interface ReportsState {
  items: PetReport[];
  selected: PetReport | null;
  summary: SummaryStats | null;
  loading: boolean;
  summaryLoading: boolean;
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReportsState = {
  items: [],
  selected: null,
  summary: null,
  loading: false,
  summaryLoading: false,
  submitStatus: 'idle',
  error: null,
};

const cleanParams = (params: ReportFilters) => {
  const result: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value as string;
    }
  });
  return result;
};

export const fetchReports = createAsyncThunk<PetReport[], ReportFilters | undefined>(
  'reports/fetch',
  async (filters = {}) => {
    const { data } = await api.get<PetReport[]>('/reports', {
      params: cleanParams(filters),
    });
    return data;
  },
);

export const fetchReportById = createAsyncThunk<PetReport, number>('reports/fetchById', async (id) => {
  const { data } = await api.get<PetReport>(`/reports/${id}`);
  return data;
});

export const createReport = createAsyncThunk<PetReport, FormData>('reports/create', async (payload) => {
  const { data } = await api.post<PetReport>('/reports', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
});

export const updateReportStatus = createAsyncThunk<PetReport, { id: number; status: ReportStatus }>(
  'reports/updateStatus',
  async ({ id, status }) => {
    const { data } = await api.patch<PetReport>(`/reports/${id}/status`, { status });
    return data;
  },
);

export const fetchSummary = createAsyncThunk<SummaryStats>('reports/summary', async () => {
  const { data } = await api.get<SummaryStats>('/reports/summary');
  return data;
});

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'ไม่สามารถดึงข้อมูลได้';
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createReport.pending, (state) => {
        state.submitStatus = 'loading';
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.items = [action.payload, ...state.items];
      })
      .addCase(createReport.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.error.message ?? 'เกิดข้อผิดพลาดในการบันทึก';
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(fetchSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state) => {
        state.summaryLoading = false;
      });
  },
});

export default reportSlice.reducer;

