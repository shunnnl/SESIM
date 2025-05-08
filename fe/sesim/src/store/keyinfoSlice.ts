import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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

export const fetchKeyInfo = createAsyncThunk(
    'keyinfo/fetchKeyInfo',
    async () => {
        const response = await axios.get('/api/your-endpoint');
        return response.data;
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
                state.projects = action.payload;
                state.loading = false;
            })
            .addCase(fetchKeyInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'API 호출 오류';
            });
    },
});

export default keyinfoSlice.reducer;
