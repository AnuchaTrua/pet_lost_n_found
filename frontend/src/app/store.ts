import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from '@/features/filters/filterSlice';
import reportsReducer from '@/features/reports/reportSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    reports: reportsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

