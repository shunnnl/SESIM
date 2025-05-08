// types/keyinfo.ts
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

export interface KeyInfoResponse {
    success: boolean;
    data: {
        projects: Project[];
    };
    error: string | null;
}
