// keyinfoSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Model과 Project 인터페이스 정의
export interface Model {
    id: number;
    name: string;
    albAddress: string;
    deployStatus: "DEPLOYED" | "NOT_DEPLOYED" | string;
    isApiKeyCheck: boolean;
}

export interface Project {
    id: number;
    name: string;
    models: Model[];
}

// 초기 상태 정의
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

// 비동기 액션 생성
export const fetchKeyInfo = createAsyncThunk(
    'keyinfo/fetchKeyInfo', 
    async () => {
        // API 호출 예시 (axios 사용)
        const response = await axios.get('/api/your-endpoint');  // 실제 API URL로 수정
        return response.data;  // API에서 반환된 데이터를 반환
    }
);

const keyinfoSlice = createSlice({
    name: 'keyinfo',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchKeyInfo.pending, (state) => {
                state.loading = true;
                state.error = null;  // 로딩 상태일 때 에러 초기화
            })
            .addCase(fetchKeyInfo.fulfilled, (state, action) => {
                state.projects = action.payload;  // API에서 받아온 데이터로 프로젝트 상태 업데이트
                state.loading = false;
            })
            .addCase(fetchKeyInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'API 호출 오류';  // 실패 시 에러 메시지 설정
            });
    },
});

export default keyinfoSlice.reducer;
