export interface Step {
    stepId: number;
    stepOrder: number;
    stepName: string;
    stepStatus: 'DEPLOYED' | 'NOT_DEPLOYED' | 'PENDING' | 'DEPLOYING' | string;
}

export interface Model {
    modelId: number;
    modelName: string;
    apiKeyCheck: boolean;
}

export interface Project {
    projectId: number;
    projectName: string;
    albAddress: string;
    steps: Step[];
    models: Model[];
}
