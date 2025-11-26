// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "@slices/mapSlice";
import authReducer from "@slices/authSlice";
import projectReducer from "@slices/projectSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    auth: authReducer,
    projects: projectReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
