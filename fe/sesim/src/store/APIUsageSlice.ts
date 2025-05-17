import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roundCost, roundSeconds } from "../utils/rounding";
import * as apiUsageService from "../services/apiUsageService";
import { APIUsageProjectInfo, APIUsageModelInfo } from "../types/ProjectTypes";
import {
    ProjectCost, 
    MonthProjectCost, 
    DailyProjectCost, 
    MonthModelCost, 
    MonthModelSecond, 
    DailyModelCost, 
    ProjectSecond, 
    DailyProjectSecond, 
    ModelCost, 
    ModelSecond, 
    DailyModelSecond,
    AllProjectsAllPeriodsData,
    SpecificProjectAllPeriodsData,
    AllProjectsMonthPeriodData,
    SpecificProjectMonthPeriodData
} from "../types/APIUsageTypes";

interface APIUsageInitData {
    createdAt: string;
    totalCost: number;
    totalRequests: number;
    totalSeconds: number;
    lastTotalCost: number;
    lastTotalRequests: number;
    lastTotalSeconds: number;
    projects: APIUsageProjectInfo[];
    models: APIUsageModelInfo[];
}

interface APIUsageState {
    isInitDataLoaded: boolean;
    apiUsageInitData: APIUsageInitData | null;
    allProjectsAllPeriodsData: AllProjectsAllPeriodsData | null;
    specificProjectAllPeriodsData: SpecificProjectAllPeriodsData | null;
    allProjectsMonthPeriodData: AllProjectsMonthPeriodData | null;
    specificProjectMonthPeriodData: SpecificProjectMonthPeriodData | null;
    isInitDataLoading: boolean;
    isAllProjectsAllPeriodsLoading: boolean;
    isSpecificProjectAllPeriodsLoading: boolean;
    isAllProjectsMonthPeriodLoading: boolean;
    isSpecificProjectMonthPeriodLoading: boolean;
    error: string | null;
};

const apiUsageInitData: APIUsageInitData = {
    createdAt: "2025-01-01",
    totalCost: 0,
    totalRequests: 0,
    totalSeconds: 0,
    lastTotalCost: 0,
    lastTotalRequests: 0,
    lastTotalSeconds: 0,
    projects: [],
    models: []
};

const initialState: APIUsageState = {
    isInitDataLoaded: false,
    apiUsageInitData: apiUsageInitData,
    allProjectsAllPeriodsData: null,
    specificProjectAllPeriodsData: null,
    allProjectsMonthPeriodData: null,
    specificProjectMonthPeriodData: null,
    isInitDataLoading: false,
    isAllProjectsAllPeriodsLoading: false,
    isSpecificProjectAllPeriodsLoading: false,
    isAllProjectsMonthPeriodLoading: false,
    isSpecificProjectMonthPeriodLoading: false,
    error: null
};


export const setInitDataLoaded = createAsyncThunk("apiUsage/setInitDataLoaded", async () => {
    return true;
});


export const fetchAPIUsageInitData = createAsyncThunk(
    "apiUsage/fetchAPIUsageInitData",
    async () => {
        const raw = await apiUsageService.getAPIUsageInit();
        return {
            ...raw.data,
            totalCost: roundCost(raw.data.totalCost),
            totalRequests: raw.data.totalRequests,
            totalSeconds: roundSeconds(raw.data.totalSeconds),
            lastTotalCost: roundCost(raw.data.lastTotalCost),
            lastTotalRequests: raw.data.lastTotalRequests,
            lastTotalSeconds: roundSeconds(raw.data.lastTotalSeconds),
        };
    }
);

export const fetchAllProjectsAllPeriods = createAsyncThunk(
    "apiUsage/fetchAllProjectsAllPeriods",
    async ({ createdAt }: { createdAt: string }) => {
        const raw = await apiUsageService.getAPIUsageAllProjectsAllPeriodsData(createdAt);
        return {
            ...raw.data,
            totalCost: roundCost(raw.data.totalCost),
            totalSeconds: roundSeconds(raw.data.totalSeconds),
            projectCosts: raw.data.projectCosts.map((pc: ProjectCost) => ({
                ...pc,
                cost: roundCost(pc.cost),
            })),
            monthProjectCosts: raw.data.monthProjectCosts.map((mpc: MonthProjectCost) => ({
                ...mpc,
                projectCosts: mpc.projectCosts.map((pc: ProjectCost) => ({
                    ...pc,
                    cost: roundCost(pc.cost),
                })),
            })),
            dailyProjectCosts: raw.data.dailyProjectCosts.map((dpc: DailyProjectCost) => ({
                ...dpc,
                totalCost: roundCost(dpc.totalCost),
                projectCosts: dpc.projectCosts.map((pc: ProjectCost) => ({
                    ...pc,
                    cost: roundCost(pc.cost),
                })),
            })),
        };
    }
);

export const fetchSpecificProjectAllPeriods = createAsyncThunk(
    "apiUsage/fetchSpecificProjectAllPeriods",
    async ({ projectId, createdAt }: { projectId: string; createdAt: string }) => {
        const raw = await apiUsageService.getAPIUsageSpecificProjectAllPeriodsData(projectId, createdAt);
        return {
            ...raw.data,
            totalCost: roundCost(raw.data.totalCost),
            totalSeconds: roundSeconds(raw.data.totalSeconds),
            monthModelCost: raw.data.monthModelCost.map((mmc: MonthModelCost) => ({
                ...mmc,
                modelCosts: mmc.modelCosts.map((mc: ModelCost) => ({
                    ...mc,
                    cost: roundCost(mc.cost),
                })),
            })),
            monthModelRequest: raw.data.monthModelRequest,
            monthModelSecond: raw.data.monthModelSecond.map((mms: MonthModelSecond) => ({
                ...mms,
                modelSeconds: mms.modelSeconds.map((ms: ModelSecond) => ({
                    ...ms,
                    second: roundSeconds(ms.second),
                })),
            })),
            dailyModelCost: raw.data.dailyModelCost.map((dmc: DailyModelCost) => ({
                ...dmc,
                totalCost: roundCost(dmc.totalCost),
                modelCosts: dmc.modelCosts.map((mc: ModelCost) => ({
                    ...mc,
                    cost: roundCost(mc.cost),
                })),
            })),
        };
    }
);

export const fetchAllProjectsMonthPeriod = createAsyncThunk(
    "apiUsage/fetchAllProjectsMonthPeriod",
    async ({ month }: { month: string }) => {
        const raw = await apiUsageService.getAPIUsageAllProjectsMonthPeriodData(month);

        return {
            ...raw.data,
            curMonthTotalCost: roundCost(raw.data.curMonthTotalCost),
            lastMonthTotalCost: roundCost(raw.data.lastMonthTotalCost),
            curMonthTotalRequests: raw.data.curMonthTotalRequests,
            lastMonthTotalRequests: raw.data.lastMonthTotalRequests,
            curMonthTotalSeconds: roundSeconds(raw.data.curMonthTotalSeconds),
            lastMonthTotalSeconds: roundSeconds(raw.data.lastMonthTotalSeconds),
            projectCosts: raw.data.projectCosts.map((pc: ProjectCost) => ({
                ...pc,
                cost: roundCost(pc.cost),
            })),
            projectSeconds: raw.data.projectSeconds.map((ps: ProjectSecond) => ({
                ...ps,
                second: roundSeconds(ps.second),
            })),
            dailyProjectCosts: raw.data.dailyProjectCosts.map((dpc: DailyProjectCost) => ({
                ...dpc,
                totalCost: roundCost(dpc.totalCost),
                projectCosts: dpc.projectCosts.map((pc: ProjectCost) => ({
                    ...pc,
                    cost: roundCost(pc.cost),
                })),
            })),
            dailyProjectRequests: raw.data.dailyProjectRequests,
            dailyProjectSeconds: raw.data.dailyProjectSeconds.map((dps: DailyProjectSecond) => ({
                ...dps,
                totalSeconds: roundSeconds(dps.totalSeconds),
                projectSeconds: dps.projectSeconds.map((ps: ProjectSecond) => ({
                    ...ps,
                    second: roundSeconds(ps.second),
                })),
            })),
    };
    }
);

export const fetchSpecificProjectMonthPeriod = createAsyncThunk(
    "apiUsage/fetchSpecificProjectMonthPeriod",
    async ({ projectId, month }: { projectId: string; month: string }) => {
        const raw = await apiUsageService.getAPIUsageSpecificProjectMonthPeriodData(projectId, month);

        return {
            ...raw.data,
            curMonthTotalCost: roundCost(raw.data.curMonthTotalCost),
            lastMonthTotalCost: roundCost(raw.data.lastMonthTotalCost),
            curMonthTotalSeconds: roundSeconds(raw.data.curMonthTotalSeconds),
            lastMonthTotalSeconds: roundSeconds(raw.data.lastMonthTotalSeconds),
            modelCosts: raw.data.modelCosts.map((m: ModelCost) => ({ ...m, cost: roundCost(m.cost) })),
            modelSeconds: raw.data.modelSeconds.map((m: ModelSecond) => ({ ...m, second: roundSeconds(m.second) })),
            dailyModelCosts: raw.data.dailyModelCosts.map((d: DailyModelCost) => ({
                ...d,
                totalCost: roundCost(d.totalCost),
                modelCosts: d.modelCosts.map((m: ModelCost) => ({ ...m, cost: roundCost(m.cost) })),
            })),
            dailyModelSeconds: raw.data.dailyModelSeconds.map((d: DailyModelSecond) => ({
                ...d,
                totalSeconds: roundSeconds(d.totalSeconds),
                modelSeconds: d.modelSeconds.map((m: ModelSecond) => ({ ...m, second: roundSeconds(m.second) })),
            })),
    };
    }
);

const apiUsageSlice = createSlice({
    name: "apiUsage",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAPIUsageInitData.pending, (state) => {
                state.isInitDataLoading = true;
            })
            .addCase(fetchAPIUsageInitData.fulfilled, (state, action) => {
                state.apiUsageInitData = action.payload;
                state.isInitDataLoading = false;
            })
            .addCase(fetchAllProjectsAllPeriods.pending, (state) => {
                state.isAllProjectsAllPeriodsLoading = true;
            })
            .addCase(fetchAllProjectsAllPeriods.fulfilled, (state, action) => {
                state.isAllProjectsAllPeriodsLoading = false;
                state.allProjectsAllPeriodsData = action.payload;
            })
            .addCase(fetchAllProjectsAllPeriods.rejected, (state, action) => {
                state.isAllProjectsAllPeriodsLoading = false;
                state.error = action.error.message || "error";
            })
            .addCase(fetchSpecificProjectAllPeriods.pending, (state) => {
                state.isSpecificProjectAllPeriodsLoading = true;
            })
            .addCase(fetchSpecificProjectAllPeriods.fulfilled, (state, action) => {
                state.isSpecificProjectAllPeriodsLoading = false;
                state.specificProjectAllPeriodsData = action.payload;
            })
            .addCase(fetchSpecificProjectAllPeriods.rejected, (state, action) => {
                state.isSpecificProjectAllPeriodsLoading = false;
                state.error = action.error.message || "error";
            })
            .addCase(fetchAllProjectsMonthPeriod.pending, (state) => {
                state.isAllProjectsMonthPeriodLoading = true;
            })
            .addCase(fetchAllProjectsMonthPeriod.fulfilled, (state, action) => {
                state.isAllProjectsMonthPeriodLoading = false;
                state.allProjectsMonthPeriodData = action.payload;
            })
            .addCase(fetchAllProjectsMonthPeriod.rejected, (state, action) => {
                state.isAllProjectsMonthPeriodLoading = false;
                state.error = action.error.message || "error";
            })
            .addCase(fetchSpecificProjectMonthPeriod.pending, (state) => {
                state.isSpecificProjectMonthPeriodLoading = true;
            })
            .addCase(fetchSpecificProjectMonthPeriod.fulfilled, (state, action) => {
                state.isSpecificProjectMonthPeriodLoading = false;
                state.specificProjectMonthPeriodData = action.payload;
            })
            .addCase(fetchSpecificProjectMonthPeriod.rejected, (state, action) => {
                state.isSpecificProjectMonthPeriodLoading = false;
                state.error = action.error.message || "error";
            })
            .addCase(setInitDataLoaded.fulfilled, (state, action) => {
                state.isInitDataLoaded = true;
            });
    }
});

export default apiUsageSlice.reducer;