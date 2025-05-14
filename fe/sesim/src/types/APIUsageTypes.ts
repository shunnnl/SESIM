export interface IntervalDayProject {
    date: string;
    projectIntervalRequestCount: string;
    projectIntervalSeconds: number;
    projectIntervalCost: number;
};

export interface IntervalMonthProject {
    date: string;
    projectIntervalRequestCount: number;
    projectIntervalSeconds: number;
    projectIntervalCost: number;
};

export interface IntervalDayModels {
    date: string;
    intervalRequestCount: number;
    intervalSeconds: number;
    intervalCost: number;
};

export interface IntervalMonthModels {
    date: string;
    intervalRequestCount: number;
    intervalSeconds: number;
    intervalCost: number;
};

export interface APIUsageModel {
    modelId: number;
    modelName: string;
    totalRequestCount: number;
    totalSeconds: number;
    hourlyRate: number;
    totalCost: number;
    intervalDayModels: IntervalDayModels[];
    intervalMonthModels: IntervalMonthModels[];
};

export interface APIUsageProject {
    projectId: number;
    projectName: string;
    projectTotalRequestCount: number;
    projectTotalSeconds: number;
    projectTotalCost: number;
    intervalDayProjects: IntervalDayProject[];
    intervalMonthProjects: IntervalMonthProject[];
    models: APIUsageModel[];
};
