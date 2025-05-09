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
    id: number;
    name: string;
    albAddress: string;
    steps: Step[];
    models: Model[];
}

export interface KeyInfoResponse {
    success: boolean;
    data: {
        projects: Project[];
    };
    error: string | null;
}
