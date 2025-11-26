import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, setAuthToken } from '@/lib/api';
import type { User } from '@/types/user';
import type { RootState } from '@/app/store';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  lineId?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const TOKEN_KEY = 'authToken';

const initialState: AuthState = {
  token: null,
  user: null,
  status: 'idle',
  error: null,
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

export const login = createAsyncThunk<{ token: string; user: User }, Credentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', credentials);
      return data;
    } catch (error) {
      return rejectWithValue('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  },
);

export const fetchCurrentUser = createAsyncThunk<User, void, { state: RootState; rejectValue: string }>(
  'auth/me',
  async (_payload, { getState, rejectWithValue, dispatch }) => {
    const token = getState().auth.token;
    if (!token) {
      return rejectWithValue('no-token');
    }
    try {
      const { data } = await api.get<User>('/auth/me');
      return data;
    } catch (error) {
      dispatch(logout());
      return rejectWithValue('unauthorized');
    }
  },
);

export const register = createAsyncThunk<{ token: string; user: User }, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', payload);
      return data;
    } catch (error) {
      return rejectWithValue('สมัครสมาชิกไม่สำเร็จ อีเมลอาจถูกใช้ไปแล้ว');
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
        setAuthToken(token);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
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
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        storeToken(action.payload.token);
        setAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'ไม่สามารถเข้าสู่ระบบได้';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        if (action.payload === 'unauthorized') {
          state.token = null;
          state.user = null;
          storeToken(null);
          setAuthToken(null);
        }
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        storeToken(action.payload.token);
        setAuthToken(action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'สมัครสมาชิกไม่สำเร็จ';
      });
  },
});

export const { loadStoredToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
