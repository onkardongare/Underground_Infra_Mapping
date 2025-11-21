// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "@slices/mapSlice";
import authReducer from "@slices/authSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
