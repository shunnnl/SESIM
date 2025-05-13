import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project} from "../types/ProjectTypes";

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
            action: PayloadAction<Project>
        ) => {
            const updatedProject = action.payload;
            const index = state.projects.findIndex(p => p.projectId === updatedProject.projectId);

            if (index !== -1) {
                state.projects[index] = updatedProject;
                console.log("✅ [updateProjectStatus] 프로젝트 전체 갱신 완료:", updatedProject.projectName);
            } else {
                console.warn("⚠️ [updateProjectStatus] 프로젝트 ID를 찾을 수 없음:", updatedProject.projectId);
            }
        }
    },
});

export const { setAllProjects, updateProjectStatus } = keyinfoSlice.actions;
export default keyinfoSlice.reducer;