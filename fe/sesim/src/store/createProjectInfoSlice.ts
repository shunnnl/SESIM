import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModelConfig {
    modelId: number;
    specId: number;
    regionId: number;
}

interface CreateProjectInfoState {
    accessKey: string;
    secretKey: string;
    sessionToken: string;
    arnId: number | null;
    projectName: string;
    projectDescription: string;
    selectedModels: any[];
    modelConfigs: ModelConfig[];
}

const initialState: CreateProjectInfoState = {
    accessKey: "",
    secretKey: "",
    sessionToken: "",
    arnId: null,
    projectName: "",
    projectDescription: "",
    selectedModels: [],
    modelConfigs: [],
};

export const createProjectInfoSlice = createSlice({
    name: "createProjectInfo",
    initialState,
    reducers: {
        setAwsSession: (state, action: PayloadAction<{accessKey: string, secretKey: string, sessionToken: string, arnId: number | null}>) => {
            state.accessKey = action.payload.accessKey;
            state.secretKey = action.payload.secretKey;
            state.sessionToken = action.payload.sessionToken;
            state.arnId = action.payload.arnId;
        },
        clearAwsSession: (state) => {
            state.accessKey = '';
            state.secretKey = '';
            state.sessionToken = '';
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
