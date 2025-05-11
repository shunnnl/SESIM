import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project, Step } from "../types/keyinfoTypes";

interface DeploymentState {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

const initialState: DeploymentState = {
    projects: [],
    loading: false,
    error: null,
};

const keyinfoSlice = createSlice({
    name: "keyinfo",
    initialState,
    reducers: {
        setAllProjects: (state, action: PayloadAction<Project[]>) => {
            state.projects = action.payload;
        },
        updateProjectStatus: (
            state,
            action: PayloadAction<{ projectId: number; steps: Step[] }>
        ) => {
            const { projectId, steps } = action.payload;
            console.log("🔄 [updateProjectStatus] Received:", { projectId, steps });

            const project = state.projects.find(p => p.projectId === projectId);

            if (project) {
                console.log("✅ [updateProjectStatus] Found project:", project.projectName);
                project.steps = steps;
            } else {
                console.warn("⚠️ [updateProjectStatus] Project not found for ID:", projectId);
            }
        }
    },
});

export const { setAllProjects, updateProjectStatus } = keyinfoSlice.actions;
export default keyinfoSlice.reducer;