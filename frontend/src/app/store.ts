import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from '@/features/filters/filterSlice';
import reportsReducer from '@/features/reports/reportSlice';
import uiReducer from '@/features/ui/uiSlice';
import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    reports: reportsReducer,
    ui: uiReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
