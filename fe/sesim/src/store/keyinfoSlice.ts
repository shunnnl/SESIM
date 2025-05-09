import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Project, Step } from '../types/keyinfoTypes';

interface DeploymentState {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

// 초기 상태
const initialState: DeploymentState = {
    projects: [],
    loading: false,
    error: null,
};

// 초기 데이터 가져오기
export const fetchKeyInfo = createAsyncThunk(
    'keyinfo/fetchKeyInfo',
    async () => {
        const response = await axios.get('/api/your-endpoint');
        return response.data; // 서버에서 받은 데이터를 그대로 반환
    }
);

// 실시간 프로젝트 상태 업데이트
export const updateProjectStatusAsync = createAsyncThunk<
    { projectId: number; steps: Step[] },  // 반환값: projectId와 업데이트된 steps
    { projectId: number; steps: Step[] },  // 전달 인자 타입
    { rejectValue: string }  // 오류 발생 시 반환되는 값 타입
>(
    'keyinfo/updateProjectStatusAsync',
    async ({ projectId, steps }, { rejectWithValue }) => {
        try {
            // 실시간 데이터 수신 후 steps 배열을 반환
            return { projectId, steps }; // projectId와 steps 배열을 함께 반환
        } catch (error) {
            return rejectWithValue('프로젝트 상태 업데이트 실패');
        }
    }
);

const keyinfoSlice = createSlice({
    name: 'keyinfo',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchKeyInfo 액션의 상태 처리
            .addCase(fetchKeyInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchKeyInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload; // 받아온 데이터로 프로젝트 업데이트
            })
            .addCase(fetchKeyInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '초기 데이터 불러오기 오류';
            })
            // updateProjectStatusAsync 액션의 상태 처리
            .addCase(updateProjectStatusAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProjectStatusAsync.fulfilled, (state, action) => {
                state.loading = false;
                const { projectId, steps } = action.payload;

                const projectIndex = state.projects.findIndex(
                    (project) => project.id === projectId
                );
                if (projectIndex !== -1) {
                    // 해당 프로젝트의 steps 배열을 업데이트
                    state.projects[projectIndex].steps = steps;
                }
            })
            .addCase(updateProjectStatusAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? '프로젝트 상태 업데이트 오류';
            });
    },
});

export default keyinfoSlice.reducer;
