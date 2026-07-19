import { createSlice } from '@reduxjs/toolkit';

// Retrieve values from LocalStorage if present
const token = localStorage.getItem('token') || null;
const userString = localStorage.getItem('user');
let user = null;

try {
  if (userString) {
    user = JSON.parse(userString);
  }
} catch (e) {
  console.error('Error parsing user from localStorage', e);
  localStorage.removeItem('user');
}

const initialState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      
      // Persist values
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    authFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // Clean storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateProfileSuccess: (state, action) => {
      state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      }
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  authStart,
  authSuccess,
  authFail,
  logout,
  updateProfileSuccess,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
