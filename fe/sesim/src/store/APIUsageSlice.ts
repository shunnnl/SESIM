import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { APIUsageProject } from "../types/APIUsageTypes";

interface APIUsageState {
    projects: APIUsageProject[];
}

const initialState: APIUsageState = {
    projects: [],
};

const apiUsageSlice = createSlice({
    name: "apiUsage",
    initialState,
    reducers: {
        updateAPIUsageProjects: (state, action: PayloadAction<APIUsageProject[]>) => {
            state.projects = action.payload;
        },
    },
});

export const { updateAPIUsageProjects } = apiUsageSlice.actions;
export default apiUsageSlice.reducer;
