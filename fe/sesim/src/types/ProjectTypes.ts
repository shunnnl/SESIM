export interface Step {
    stepId: number;
    stepOrder: number;
    stepName: string;
    stepStatus: "PENDING" | "DEPLOYING" | "DEPLOYED" | string;
};

export interface Model {
    modelId: number;
    modelName: string;
    description: string;
    grafanaUrl:string;
};

export interface Project {
    projectId: number;
    projectName: string;
    description:string;
    albAddress: string | null;
    grafanaUrl: string;
    allowedIps: string[];
    steps: Step[];
    models: Model[];
    deployed: boolean;
};

export interface APIUsageProjectInfo {
    projectId: number;
    name: string;
    description: string;
};

export interface APIUsageModelInfo {
    modelId: number;
    name: string;
    modelPricePerHour: number;
};