import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, setAuthToken } from '@/lib/api';

interface Credentials {
  username: string;
  password: string;
}

interface AuthState {
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isAdmin: boolean;
}

const TOKEN_KEY = 'adminToken';

const initialState: AuthState = {
  token: null,
  status: 'idle',
  error: null,
  isAdmin: false,
};

const storeToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

const readToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const adminLogin = createAsyncThunk<string, Credentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ token: string }>('/auth/login', credentials);
      return data.token;
    } catch (error) {
      return rejectWithValue('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loadStoredToken: (state) => {
      const token = readToken();
      if (token) {
        state.token = token;
        state.isAdmin = true;
        setAuthToken(token);
      }
    },
    logout: (state) => {
      state.token = null;
      state.isAdmin = false;
      state.status = 'idle';
      state.error = null;
      storeToken(null);
      setAuthToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
        state.isAdmin = true;
        storeToken(action.payload);
        setAuthToken(action.payload);
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'ไม่สามารถเข้าสู่ระบบได้';
      });
  },
});

export const { loadStoredToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
