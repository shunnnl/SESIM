export interface Step {
    stepId: number;
    stepOrder: number;
    stepName: string;
    stepStatus: 'PENDING' | 'DEPLOYING' | 'DEPLOYED' | string;
}

export interface Model {
    modelId: number;
    modelName: string;
    apiKeyCheck: boolean;
}

export interface Project {
    projectId: number;
    projectName: string;
    albAddress: string | null;
    grafanaUrl: string;
    allowedIps: string[];
    steps: Step[];
    models: Model[];
    deployed: boolean;
}
