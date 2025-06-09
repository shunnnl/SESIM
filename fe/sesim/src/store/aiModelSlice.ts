import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AiModel {
    id: number;
    name: string;
    featureTitle: string;
    featureOverview: string;
    featureList: string[];
}

interface ErrorResponse {
    code: string;
    message: string;
    status: number;
}

interface ApiResponse {
    success: boolean;
    data: AiModel[];
    error: ErrorResponse | null;
}

interface AiModelState extends ApiResponse {}

const initialState: AiModelState = {
    success: false,
    data: [],
    error: null
};

const aiModelSlice = createSlice({
    name: "aiModel",
    initialState,
    reducers: {
        setAiModels: (state, action: PayloadAction<ApiResponse>) => {
            state.success = action.payload.success;
            state.data = action.payload.data;
            state.error = action.payload.error;
        }
    }
});

export const { setAiModels } = aiModelSlice.actions;
export default aiModelSlice.reducer; 