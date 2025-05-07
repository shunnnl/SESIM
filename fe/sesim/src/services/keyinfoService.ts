import api from "./api";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../types/keyinfoTypes";

interface DeploymentState {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

export const fetchKeyInfo = createAsyncThunk<Project[]>(
    "keyinfo/fetchKeyInfo",
    async () => {
        const response = await api.get("/deployment/status");
        const rawProjects = response.data?.data?.projects;

        if (!Array.isArray(rawProjects)) {
            throw new Error("projects는 배열이어야 합니다.");
        }

        return rawProjects;
    }
);

const initialState: DeploymentState = {
    projects: [],
    loading: false,
    error: null,
};

const keyinfoSlice = createSlice({
    name: "keyinfo",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchKeyInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchKeyInfo.fulfilled, (state, action: PayloadAction<Project[]>) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchKeyInfo.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Error fetching data";
            })
    },
});

export default keyinfoSlice.reducer;

