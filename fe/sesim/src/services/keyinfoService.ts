// keyinfoSlice.ts
import api from "./api";
import { KeyInfoResponse, Project } from "../types/keyinfoTypes";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// DeploymentState 정의
interface DeploymentState {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

// createAsyncThunk를 사용하여 비동기 작업 처리
export const fetchKeyInfo = createAsyncThunk(
    "keyinfo/fetchKeyInfo", // action 타입
    async () => {
        const response = await api.get("/deployment/status");
        console.log("✅ API 응답 데이터:", response.data); // API 응답 데이터 확인
        return response.data; // 반환되는 데이터는 payload로 전달됨
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
            .addCase(fetchKeyInfo.fulfilled, (state, action: PayloadAction<KeyInfoResponse>) => {
                console.log("✅ fulfilled payload:", action.payload); // fulfilled에서 payload 확인
                state.loading = false;
                state.projects = action.payload.data.projects; // 여기에서 'projects' 배열을 가져옴
                console.log("✅가져오나나:", state.projects); 
            })
            .addCase(fetchKeyInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Error fetching data";
            });
    },
});

export default keyinfoSlice.reducer;
