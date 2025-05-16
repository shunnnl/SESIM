import { APIUsageProject } from "../types/APIUsageTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 프로젝트별 비용 타입
export interface ProjectCost {
    projectId: number;
    cost: number;
}

// 월별 프로젝트 비용 타입
export interface MonthProjectCost {
    month: string;
    projectCosts: ProjectCost[];
}

// 월별 프로젝트 요청 수 타입
export interface MonthProjectRequest {
    month: string;
    projectRequests: {
        projectId: number;
        requestCount: number;
    }[];
}

// 월별 프로젝트 시간 타입
export interface MonthProjectSecond {
    month: string;
    projectSeconds: {
        projectId: number;
        second: number;
    }[];
}

// 일별 프로젝트 비용 타입
export interface DailyProjectCost {
    date: string;
    totalCost: number;
    projectCosts: ProjectCost[];
}

// API 사용량 데이터 타입
export interface AllProjectsAllPeriodsData {
    totalCost: number;
    totalRequests: number;
    totalSeconds: number;
    totalProjectCount: number;
    projectCosts: ProjectCost[];
    monthProjectCosts: MonthProjectCost[];
    monthProjectRequests: MonthProjectRequest[];
    monthProjectSeconds: MonthProjectSecond[];
    dailyProjectCosts: DailyProjectCost[];
}

// 프로젝트 정보 타입
export interface APIUsageProjectInfo {
    projectId: number;
    name: string;
    description: string;
};

// 모델 정보 타입
export interface APIUsageModelInfo {
    modelId: number;
    name: string;
    modelPricePerHour: number;
};

interface APIUsageState {
    projects: APIUsageProject[];
    createdAt: string | null;
    currentMonthCost: number;
    currentMonthRequests: number;
    currentMonthSeconds: number;
    previousMonthCost: number;
    previousMonthRequests: number;
    previousMonthSeconds: number;
    projectInfo: APIUsageProjectInfo[] | null;
    modelInfo: APIUsageModelInfo[] | null;
    allProjectsAllPeriodsData: AllProjectsAllPeriodsData | null;
    isDataLoaded: boolean;
    selectedProjectId: string;
    selectedMonth: string;
}

const initialState: APIUsageState = {
    projects: [],
    createdAt: null,
    currentMonthCost: 0,
    currentMonthRequests: 0,
    currentMonthSeconds: 0,
    previousMonthCost: 0,
    previousMonthRequests: 0,
    previousMonthSeconds: 0,
    projectInfo: null,
    modelInfo: null,
    allProjectsAllPeriodsData: null,
    isDataLoaded: false,
    selectedProjectId: "all",
    selectedMonth: "all",
};

const apiUsageSlice = createSlice({
    name: "apiUsage",
    initialState,
    reducers: {
        updateAPIUsageProjects: (state, action: PayloadAction<APIUsageProject[]>) => {
            state.projects = action.payload;
        },
        setAPIUsageInitData: (state, action) => {
            state.createdAt = action.payload.createdAt;
            state.currentMonthCost = Math.round(action.payload.totalCost * 100) / 100;
            state.currentMonthRequests = action.payload.totalRequests;
            state.currentMonthSeconds = Math.round(action.payload.totalSeconds / 3600 * 100) / 100;
            state.previousMonthCost = Math.round(action.payload.lastTotalCost * 100) / 100;
            state.previousMonthRequests = action.payload.lastTotalRequests;
            state.previousMonthSeconds = Math.round(action.payload.lastTotalSeconds / 3600 * 100) / 100;
            state.projectInfo = action.payload.projects;
            state.modelInfo = action.payload.models;
        },
        setAPIUsageData: (state, action: PayloadAction<AllProjectsAllPeriodsData>) => {
            const data = action.payload;
            
            state.allProjectsAllPeriodsData = {
                ...data,
                totalCost: Math.round(data.totalCost * 100) / 100,
                totalSeconds: Math.round(data.totalSeconds / 3600 * 100) / 100,
                projectCosts: data.projectCosts.map(pc => ({
                    ...pc,
                    cost: Math.round(pc.cost * 100) / 100,
                })),
                monthProjectCosts: data.monthProjectCosts.map(mpc => ({
                    ...mpc,
                    projectCosts: mpc.projectCosts.map(pc => ({
                        ...pc,
                        cost: Math.round(pc.cost * 100) / 100,
                    })),
                })),
                dailyProjectCosts: data.dailyProjectCosts.map(dpc => ({
                    ...dpc,
                    totalCost: Math.round(dpc.totalCost * 100) / 100,
                    projectCosts: dpc.projectCosts.map(pc => ({
                        ...pc,
                        cost: Math.round(pc.cost * 100) / 100,
                    })),
                })),
            };
            
            state.isDataLoaded = true;
        },
        setSelectedProjectId: (state, action: PayloadAction<string>) => {
            state.selectedProjectId = action.payload;
        },
        setSelectedMonth: (state, action: PayloadAction<string>) => {
            state.selectedMonth = action.payload;
        },
        clearAPIUsageData: (state) => {
            state.allProjectsAllPeriodsData = null;
            state.isDataLoaded = false;
        },
        setDataLoaded: (state, action: PayloadAction<boolean>) => {
            state.isDataLoaded = action.payload;
        },
    },
});

export const { 
    updateAPIUsageProjects,
    setAPIUsageInitData,
    setAPIUsageData,
    setSelectedProjectId,
    setSelectedMonth,
    clearAPIUsageData,
    setDataLoaded
} = apiUsageSlice.actions;
export default apiUsageSlice.reducer;