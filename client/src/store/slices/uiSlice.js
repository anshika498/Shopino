import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial dark theme preference from local storage or system preferences
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

// Apply the theme class to document element on load
if (isDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const initialState = {
  darkMode: isDark,
  searchQuery: '',
  aiAssistantOpen: false,
  comparisonProducts: [], // stores up to 3 products for detailed matrix comparison
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleAIAssistant: (state, action) => {
      state.aiAssistantOpen = action.payload !== undefined ? action.payload : !state.aiAssistantOpen;
    },
    addToComparison: (state, action) => {
      const product = action.payload;
      // Max 3 items in compare list
      const exists = state.comparisonProducts.find(p => p._id === product._id);
      if (!exists && state.comparisonProducts.length < 3) {
        state.comparisonProducts.push(product);
      }
    },
    removeFromComparison: (state, action) => {
      state.comparisonProducts = state.comparisonProducts.filter(
        p => p._id !== action.payload
      );
    },
    clearComparison: (state) => {
      state.comparisonProducts = [];
    }
  },
});

export const {
  toggleTheme,
  setSearchQuery,
  toggleAIAssistant,
  addToComparison,
  removeFromComparison,
  clearComparison,
} = uiSlice.actions;

export default uiSlice.reducer;
