// store/slices/authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@store/index";

export type UserRole = "citizen" | "government_officer" | "contractor";

export interface LocationInfo {
  lat?: number;
  lng?: number;
  description?: string; // e.g., "Pune, Maharashtra"
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: LocationInfo;
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

// ---------- Thunks (fake API for now) ----------

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location: LocationInfo;
}

export const loginUser = createAsyncThunk<
  AuthUser,
  LoginPayload,
  { state: RootState }
>("auth/loginUser", async ({ email, password }, thunkAPI) => {
  // TODO: Replace with real API call
  await new Promise((res) => setTimeout(res, 800));

  if (!email || !password) {
    return thunkAPI.rejectWithValue("Email and password are required");
  }

  // Fake user for now
  const fakeUser: AuthUser = {
    id: "1",
    name: "Demo User",
    email,
    role: "citizen",
  };

  return fakeUser;
});

export const signupUser = createAsyncThunk<
  AuthUser,
  SignupPayload,
  { state: RootState }
>("auth/signupUser", async (data, thunkAPI) => {
  // TODO: Replace with real API call
  await new Promise((res) => setTimeout(res, 1000));

  if (!data.email || !data.password || !data.name) {
    return thunkAPI.rejectWithValue("All fields are required");
  }

  const newUser: AuthUser = {
    id: "2",
    name: data.name,
    email: data.email,
    role: data.role,
    location: data.location,
  };

  return newUser;
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  // TODO: call logout endpoint if needed
  await new Promise((res) => setTimeout(res, 500));
});

// ---------- Slice ----------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
      });

    // signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        signupUser.fulfilled,
        (state, action: PayloadAction<AuthUser>) => {
          state.status = "succeeded";
          state.user = action.payload;
        }
      )
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Signup failed";
      });

    // logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
