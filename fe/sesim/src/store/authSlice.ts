import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string;
  nickname: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
}

const loadStateFromLocalStorage = (): AuthState => {
  const email = localStorage.getItem('email');
  const nickname = localStorage.getItem('nickname');
  const accessToken = localStorage.getItem('accessToken');

  if (!email || !nickname || !accessToken) {
    return { isLoggedIn: false, user: null, accessToken: null };
  }

  return {
    isLoggedIn: true,
    user: { email, nickname },
    accessToken,
  };
};

const initialState: AuthState = loadStateFromLocalStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ email: string; nickname: string; accessToken: string }>
    ) => {
      const { email, nickname, accessToken } = action.payload;
      state.isLoggedIn = true;
      state.user = { email, nickname };
      state.accessToken = accessToken;

      localStorage.setItem('email', email);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('accessToken', accessToken);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.accessToken = null;

      localStorage.removeItem('email');
      localStorage.removeItem('nickname');
      localStorage.removeItem('accessToken');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;