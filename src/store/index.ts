import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";

/**
 * Redux Toolkit store — kept minimal on purpose. It demonstrates the canonical
 * "domain/UI state in Redux, cross-cutting state in Context" split: cross-cutting
 * concerns (auth/theme/i18n) live in React Context; UI/domain state lives here.
 */
export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
