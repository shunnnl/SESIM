export interface APIUsageModel {
    modelId: number;
    modelName: string;
    totalRequestCount: number;
    totalSeconds: number;
    hourlyRate: number;
    totalCost: number;
}

export interface APIUsageProject {
    projectId: number;
    projectName: string;
    projectTotalRequestCount: number;
    projectTotalSeconds: number;
    projectTotalCost: number;
    models: APIUsageModel[];
}
