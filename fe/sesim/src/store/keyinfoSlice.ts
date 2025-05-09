// keyinfoSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Project, Step } from '../types/keyinfoTypes';
import { fetchKeyInfoAPI } from '../services/keyinfoService'; // 실제 API 호출 함수 추가

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

// ✅ 실제 API를 사용하는 fetchKeyInfo로 변경
export const fetchKeyInfo = createAsyncThunk(
    'keyinfo/fetchKeyInfo',
    async () => {
        const projects = await fetchKeyInfoAPI(); // 실제 API 호출
        return projects;
    }
);

// 실시간 프로젝트 상태 업데이트
export const updateProjectStatusAsync = createAsyncThunk<
    { projectId: number; steps: Step[] },
    { projectId: number; steps: Step[] },
    { rejectValue: string }
>(
    'keyinfo/updateProjectStatusAsync',
    async ({ projectId, steps }, { rejectWithValue }) => {
        try {
            return { projectId, steps };
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
            .addCase(fetchKeyInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchKeyInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchKeyInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '초기 데이터 불러오기 오류';
            })
            .addCase(updateProjectStatusAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProjectStatusAsync.fulfilled, (state, action) => {
                state.loading = false;
                const { projectId, steps } = action.payload;
                const projectIndex = state.projects.findIndex(p => p.id === projectId);
                if (projectIndex !== -1) {
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
