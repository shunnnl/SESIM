export interface Model {
    id: number;
    name: string;
    description: string;
    grafanaUrl: string;
}

export interface Project {
    id: number;
    name: string;
    description: string;
    models: Model[];
}