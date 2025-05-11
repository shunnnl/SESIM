import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, Step } from '../types/keyinfoTypes';

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
    name: 'keyinfo',
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
            const project = state.projects.find(p => p.projectId === projectId);
            if (project) {
                project.steps = steps;
            }
        },
    },
});

export const { setAllProjects, updateProjectStatus } = keyinfoSlice.actions;
export default keyinfoSlice.reducer;
