import api from "./api";
import { Project } from "../types/ProjectTypes";

interface ProjectResponse {
    success: boolean;
    data: {
        projects: Project[];
    };
    error: string | null;
}

export const fetchProjects = async (): Promise<Project[]> => {
    const response = await api.get<ProjectResponse>("/deployment/projects");

    if (!response.data.success || !Array.isArray(response.data.data.projects)) {
        throw new Error("프로젝트 데이터를 불러오지 못했습니다.");
    }

    return response.data.data.projects;
};
