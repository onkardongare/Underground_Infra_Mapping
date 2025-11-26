// store/slices/authSlice.ts
import { apiRequest, getAuthToken, setAuthToken } from "@/lib/api";
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
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false,
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
interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const loginUser = createAsyncThunk<
  AuthUser,
  LoginPayload,
  { rejectValue: string }
>("auth/loginUser", async (payload, thunkAPI) => {
  try {
    const data = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });

    setAuthToken(data.token);
    return data.user;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Login failed");
  }
});


export const signupUser = createAsyncThunk<
  AuthUser,
  SignupPayload,
  { rejectValue: string }
>("auth/signupUser", async (payload, thunkAPI) => {
  try {
    const data = await apiRequest<AuthResponse>("/auth/signup", {
      method: "POST",
      body: payload,
    });

    setAuthToken(data.token);
    return data.user;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Signup failed");
  }
});

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logoutUser", async (_, thunkAPI) => {
  try {
    await apiRequest<{ success: boolean }>("/auth/logout", {
      method: "POST",
      auth: true, // ✅ token auto-added
    });
  } catch (err: any) {
    // ignore if backend fails, we still clear token
  } finally {
    setAuthToken(null);
  }
});

export const fetchCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (_, thunkAPI) => {
  try {
    const data = await apiRequest<{ user: AuthUser }>("/auth/me", {
      method: "GET",
      auth: true, // ✅ auto attach token
    });

    return data.user;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to fetch user");
  }
});


// ---------- Slice ----------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    markAuthInitialized(state) {
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    }
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
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
        state.initialized = true;
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
          state.initialized = true;
        }
      )
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Signup failed";
        state.initialized = true;
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
        state.initialized = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.status = "failed";
      });

    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<AuthUser>) => {
          state.user = action.payload;
          state.status = "succeeded";
          state.initialized = true;
        }
      )
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.status = "failed";
        state.initialized = true; // even if failed, we know there is no logged-in user
      });
  },
});


export default authSlice.reducer;
export const { markAuthInitialized, clearAuthError } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthInitialized = (state: RootState) =>
  state.auth.initialized;

