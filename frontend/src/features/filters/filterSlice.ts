import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ReportFilters } from '@/types/report';

type FilterKey = Exclude<keyof ReportFilters, 'userId'>;

interface FilterState extends Omit<ReportFilters, 'userId'> {}

const initialState: FilterState = {};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters: (_state, action: PayloadAction<Partial<FilterState>>) => {
      const nextState: FilterState = {};
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }
        if (key === 'status' && (value === 'lost' || value === 'found' || value === 'closed')) {
          nextState.status = value;
          return;
        }
        if (key === 'reportType' && (value === 'lost' || value === 'found' || value === 'sighted')) {
          nextState.reportType = value;
          return;
        }
        nextState[key as Exclude<FilterKey, 'status' | 'reportType'>] = value as string;
      });
      return nextState;
    },
    resetFilters: () => initialState,
  },
});

export const { setFilters, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
