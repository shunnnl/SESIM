import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../types/ProjectTypes";
import { fetchProjects } from "../services/projectService";

interface ProjectState {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    loading: false,
    error: null,
};

export const fetchProjectList = createAsyncThunk<Project[]>(
    "project/fetchProjectList",
    async (_, thunkAPI) => {
        try {
            const projects = await fetchProjects();
            return projects;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.message || "프로젝트 불러오기 실패");
        }
    }
);

const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectList.fulfilled, (state, action: PayloadAction<Project[]>) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjectList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default projectSlice.reducer;
