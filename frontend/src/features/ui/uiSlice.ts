import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  isFormOpen: boolean;
}

const initialState: UIState = {
  isFormOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openForm: (state) => {
      state.isFormOpen = true;
    },
    closeForm: (state) => {
      state.isFormOpen = false;
    },
  },
});

export const { openForm, closeForm } = uiSlice.actions;
export default uiSlice.reducer;

