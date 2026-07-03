import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Density = "comfortable" | "compact";

interface UiState {
  /** Global search query — consumed by the records view filter. */
  searchQuery: string;
  /** Table row density — a global UI preference. */
  density: Density;
}

const initialState: UiState = {
  searchQuery: "",
  density: "comfortable",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setDensity: (state, action: PayloadAction<Density>) => {
      state.density = action.payload;
    },
    toggleDensity: (state) => {
      state.density = state.density === "comfortable" ? "compact" : "comfortable";
    },
  },
});

export const { setSearchQuery, setDensity, toggleDensity } = uiSlice.actions;
export default uiSlice.reducer;
