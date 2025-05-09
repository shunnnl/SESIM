import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModelConfig {
    modelId: number;
    specId: number;
    regionId: number;
}

interface CreateProjectInfoState {
    arnId: number | null;
    roleArn: string;
    projectName: string;
    projectDescription: string;
    selectedModels: any[];
    modelConfigs: ModelConfig[];
}

const initialState: CreateProjectInfoState = {
    arnId: null,
    roleArn: "",
    projectName: "",
    projectDescription: "",
    selectedModels: [],
    modelConfigs: [],
};

export const createProjectInfoSlice = createSlice({
    name: "createProjectInfo",
    initialState,
    reducers: {
        setAwsSession: (state, action: PayloadAction<{arnId: number | null, roleArn: string}>) => {
            state.arnId = action.payload.arnId;
            state.roleArn = action.payload.roleArn;
        },
        clearAwsSession: (state) => {
            state.roleArn = '';
            state.arnId = null;
        },
        setProjectInfo: (state, action: PayloadAction<{projectName: string, projectDescription: string}>) => {
            state.projectName = action.payload.projectName;
            state.projectDescription = action.payload.projectDescription;
        },
        clearProjectInfo: (state) => {
            state.projectName = '';
            state.projectDescription = '';
        },
        setSelectedModels: (state, action: PayloadAction<any[]>) => {
            state.selectedModels = action.payload;
        },
        clearSelectedModels: (state) => {
            state.selectedModels = [];
        },
        setModelConfigs: (state, action: PayloadAction<ModelConfig[]>) => {
            state.modelConfigs = action.payload;
        },
        setModelConfig: (state, action: PayloadAction<ModelConfig>) => {
            state.modelConfigs.push(action.payload);
        },
        clearModelConfig: (state) => {
            state.modelConfigs = [];
        },
    },
});

export const { setAwsSession, clearAwsSession, setProjectInfo, clearProjectInfo, setSelectedModels, clearSelectedModels, setModelConfigs, setModelConfig, clearModelConfig } = createProjectInfoSlice.actions;
export default createProjectInfoSlice.reducer;
