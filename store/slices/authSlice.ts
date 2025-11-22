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
