// store/slices/projectSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiRequest } from "@/lib/api";
import type { RootState } from "@store/index";

export type ProjectStatus = "planning" | "active" | "completed" | "pending";

export type GeoJSONGeometry = {
  type:
    | "Point"
    | "LineString"
    | "Polygon"
    | "MultiPoint"
    | "MultiLineString"
    | "MultiPolygon";
  coordinates: any;
};

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: ProjectStatus;
  utilityType?: string;
  startDate?: string;
  endDate?: string;
  geometry?: GeoJSONGeometry;
  approved: boolean;
  approvedById?: string;
  approvedAt?: string;
}
interface CreateProjectPayload {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  geometry?: GeoJSONGeometry;
  status?: ProjectStatus;
  utilityType?: string;
}
interface UpdateProjectPayload {
  id: string;
  updates: Partial<
    Pick<
      Project,
      "name" | "description" | "status" | "geometry" | "startDate" | "endDate"
    >
  >;
}

interface ProjectState {
  projects: Project[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  status: "idle",
  error: null,
};

// ---------- Thunks ----------

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("projects/fetchProjects", async (_, thunkAPI) => {
  try {
    const data = await apiRequest<{ projects: Project[] }>("/projects", {
      method: "GET",
      auth: true,
    });
    return data.projects;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to fetch projects");
  }
});

export const fetchProjectsByUtility = createAsyncThunk<
  Project[],
  string[], // selected layers
  { rejectValue: string }
>("projects/fetchProjectsByUtility", async (layers, thunkAPI) => {
  try {
    const query = layers.join(","); // "Sewage,Electric Line"

    const data = await apiRequest<{ projects: Project[] }>(
      `/projects?utilityType=${query}`,
      {
        method: "GET",
        auth: true,
      }
    );

    console.log(data);
    return data.projects;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to fetch projects");
  }
});

export const createProject = createAsyncThunk<
  Project,
  CreateProjectPayload,
  { rejectValue: string }
>("projects/createProject", async (payload, thunkAPI) => {
  try {
    console.log("project creation", payload);
    const data = await apiRequest<{ project: Project }>("/projects", {
      method: "POST",
      body: payload,
      auth: true,
    });
    return data.project;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to create project");
  }
});

export const updateProject = createAsyncThunk<
  Project,
  UpdateProjectPayload,
  { rejectValue: string }
>("projects/updateProject", async ({ id, updates }, thunkAPI) => {
  try {
    const data = await apiRequest<{ project: Project }>(`/projects/${id}`, {
      method: "PUT",
      body: updates,
      auth: true,
    });
    return data.project;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to update project");
  }
});

export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("projects/deleteProject", async (id, thunkAPI) => {
  try {
    await apiRequest<void>(`/projects/${id}`, {
      method: "DELETE",
      auth: true,
    });
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to delete project");
  }
});

export const approveProject = createAsyncThunk<
  Project,
  string,
  { rejectValue: string }
>("projects/approveProject", async (id, thunkAPI) => {
  try {
    const data = await apiRequest<{ project: Project }>(
      `/projects/${id}/approve`,
      {
        method: "PATCH",
        auth: true,
      }
    );
    return data.project;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to approve project");
  }
});

// ---------- Slice ----------

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.status = "succeeded";
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch projects";
      })

      // fetch by utility
      .addCase(fetchProjectsByUtility.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProjectsByUtility.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.status = "succeeded";
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjectsByUtility.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch projects";
      })

      // create
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })

      // update
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.projects.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.projects[idx] = action.payload;
      })

      // delete
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })

      // approve
      .addCase(approveProject.fulfilled, (state, action) => {
        const idx = state.projects.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.projects[idx] = action.payload;
      });
  },
});

export default projectSlice.reducer;
export const selectProjects = (state: RootState) => state.projects.projects;
export const selectProjectStatus = (state: RootState) => state.projects.status;
export const selectProjectError = (state: RootState) => state.projects.error;
