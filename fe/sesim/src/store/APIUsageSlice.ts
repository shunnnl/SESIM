import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { APIUsageProject } from "../types/APIUsageTypes";
import { fetchAPIUsage } from "../services/APIUsageService";

interface APIUsageState {
    projects: APIUsageProject[];
    loading: boolean;
    error: string | null;
}

const initialState: APIUsageState = {
    projects: [],
    loading: false,
    error: null,
};

export const fetchAPIUsageList = createAsyncThunk<APIUsageProject[]>(
    "apiUsage/fetchAPIUsageList",
    async (_, thunkAPI) => {
        try {
            const projects = await fetchAPIUsage();
            return projects;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.message || "API 사용량 불러오기 실패");
        }
    }
);

const apiUsageSlice = createSlice({
    name: "apiUsage",
    initialState,
    reducers: {
        updateAPIUsageProjects: (state, action: PayloadAction<APIUsageProject[]>) => {
            state.projects = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAPIUsageList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAPIUsageList.fulfilled, (state, action: PayloadAction<APIUsageProject[]>) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchAPIUsageList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// export 액션 추가
export const { updateAPIUsageProjects } = apiUsageSlice.actions;



export default apiUsageSlice.reducer;
