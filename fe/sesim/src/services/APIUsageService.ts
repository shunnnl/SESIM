import api from "./api";
import { APIUsageProject } from "../types/APIUsageTypes";

interface APIUsageResponse {
    success: boolean;
    data: {
        projects: APIUsageProject[];
    };
    error: string | null;
}

export const fetchAPIUsage = async (): Promise<APIUsageProject[]> => {
    const response = await api.get<APIUsageResponse>("/deployment/projects/usage");

    if (!response.data.success || !Array.isArray(response.data.data.projects)) {
        throw new Error("API 사용량 데이터를 불러오지 못했습니다.");
    }

    return response.data.data.projects;
};


