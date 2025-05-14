import { APIUsageProject } from "../types/APIUsageTypes";

export interface MonthOption {
    value: string;
    label: string;
};

export interface CostPerMonth {
    month: string;
    cost: number;
};

export interface RequestCountPerMonth {
    month: string;
    requestCount: number;
};

export interface SecondsPerMonth {
    month: string;
    seconds: number;
};

export interface CostPerDay {
    day: string;
    cost: number;
};

export interface AllProjectsAllPeriodsData {
    allCost: number;
    allRequestCount: number;
    allSeconds: number;
    projectCount: number;
    allCostForThreeMonths: CostPerMonth[];
    allRequestCountForThreeMonths: RequestCountPerMonth[];
    allSecondsForThreeMonths: SecondsPerMonth[];
    allCostForThreeMonthsCumulative: CostPerDay[];
};

export interface ProjectAllPeriodsData {
    allCost: number;
    allRequestCount: number;
    allSeconds: number;
    allCostForThreeMonths: CostPerMonth[];
    allRequestCountForThreeMonths: RequestCountPerMonth[];
    allSecondsForThreeMonths: SecondsPerMonth[];
    allCostForThreeMonthsVerDaily: CostPerDay[];
};


// 날짜 필터 옵션 생성
export const getMonthOptionsByCreatedAtFunc = ( userCreatedAt: string ): MonthOption[] => {
    const createdDate = new Date(userCreatedAt);
    const currentDate = new Date();
    const options: MonthOption[] = [];

    const iterateDate = new Date(createdDate);
    iterateDate.setDate(1);

    while (iterateDate <= currentDate) {
        const year = iterateDate.getFullYear();
        const month = iterateDate.getMonth() + 1;
        const monthStr = month.toString().padStart(2, "0");

        options.push({
            value: `${year}-${monthStr}`,
            label: `${year}년 ${month}월`,
        });
    
        iterateDate.setMonth(iterateDate.getMonth() + 1);
    }

    options.push({
        value: "all",
        label: "전체 기간",
    });

    return options.reverse();
};


// 모든 프로젝트의 모든 기간 데이터 집계
export const getAllProjectsAllPeriodsData = (projects: APIUsageProject[]): AllProjectsAllPeriodsData => {
    const allIntervalMonthProjects = projects.flatMap(project => project.intervalMonthProjects);
    const allIntervalDayProjects = projects.flatMap(project => project.intervalDayProjects);

    const monthlyCosts: { [date: string]: number } = {};
    const monthlyRequestCounts: { [date: string]: number } = {};
    const monthlySeconds: { [date: string]: number } = {};
    const dailyCosts: { [date: string]: number } = {};

    for (const imp of allIntervalMonthProjects) {
        monthlyCosts[imp.date] = (monthlyCosts[imp.date] || 0) + (Math.round(imp.projectIntervalCost * 100) / 100);  // 월별 비용 집계
        monthlyRequestCounts[imp.date] = (monthlyRequestCounts[imp.date] || 0) + imp.projectIntervalRequestCount;  // 월별 요청 수 집계
        monthlySeconds[imp.date] = (monthlySeconds[imp.date] || 0) + (Math.round(imp.projectIntervalSeconds / 3600 * 100) / 100);  // 사용 시간(초) 집계
    }

    for (const imp of allIntervalDayProjects) {
        dailyCosts[imp.date] = (dailyCosts[imp.date] || 0) + (Math.round(imp.projectIntervalCost * 100) / 100);  // 일별 비용 집계
    }

    return {
        allCost: Math.round(projects.reduce((acc, project) => acc + project.projectTotalCost, 0) * 100) / 100,
        allRequestCount: Math.round(projects.reduce((acc, project) => acc + project.projectTotalRequestCount, 0)),
        allSeconds: Math.round(projects.reduce((acc, project) => acc + project.projectTotalSeconds, 0) / 3600 * 100) / 100,
        projectCount: projects.length,
        allCostForThreeMonths: Object.entries(monthlyCosts).map(([month, cost]) => ({ month, cost })),
        allRequestCountForThreeMonths: Object.entries(monthlyRequestCounts).map(([month, requestCount]) => ({ month, requestCount })),
        allSecondsForThreeMonths:  Object.entries(monthlySeconds).map(([month, seconds]) => ({ month, seconds })),
        allCostForThreeMonthsCumulative: Object.entries(dailyCosts).map(([day, cost]) => ({ day, cost })),
    }
};


// 프로젝트별 모든 기간 데이터 집계
export const getProjectAllPeriodsData = (projects: APIUsageProject[], projectId: number): ProjectAllPeriodsData => {
    const allIntervalMonthProjects = projects.filter(project => project.projectId === projectId).flatMap(project => project.intervalMonthProjects);
    const allIntervalDayProjects = projects.filter(project => project.projectId === projectId).flatMap(project => project.intervalDayProjects);

    const monthlyCosts: { [date: string]: number } = {};
    const monthlyRequestCounts: { [date: string]: number } = {};
    const monthlySeconds: { [date: string]: number } = {};
    const dailyCosts: { [date: string]: number } = {};

    for (const imp of allIntervalMonthProjects) {
        monthlyCosts[imp.date] = (monthlyCosts[imp.date] || 0) + (Math.round(imp.projectIntervalCost * 100) / 100);  // 월별 비용 집계
        monthlyRequestCounts[imp.date] = (monthlyRequestCounts[imp.date] || 0) + imp.projectIntervalRequestCount;  // 월별 요청 수 집계
        monthlySeconds[imp.date] = (monthlySeconds[imp.date] || 0) + (Math.round(imp.projectIntervalSeconds / 3600 * 100) / 100);  // 사용 시간(초) 집계
    }

    for (const imp of allIntervalDayProjects) {
        dailyCosts[imp.date] = (dailyCosts[imp.date] || 0) + (Math.round(imp.projectIntervalCost * 100) / 100);  // 일별 비용 집계
    }

    return {
        allCost: Math.round(projects.reduce((acc, project) => acc + project.projectTotalCost, 0) * 100) / 100,
        allRequestCount: Math.round(projects.reduce((acc, project) => acc + project.projectTotalRequestCount, 0)),
        allSeconds: Math.round(projects.reduce((acc, project) => acc + project.projectTotalSeconds, 0) / 3600 * 100) / 100,
        allCostForThreeMonths: Object.entries(monthlyCosts).map(([month, cost]) => ({ month, cost })),
        allRequestCountForThreeMonths: Object.entries(monthlyRequestCounts).map(([month, requestCount]) => ({ month, requestCount })),
        allSecondsForThreeMonths:  Object.entries(monthlySeconds).map(([month, seconds]) => ({ month, seconds })),
        allCostForThreeMonthsVerDaily: Object.entries(dailyCosts).map(([day, cost]) => ({ day, cost })),
    }
};
