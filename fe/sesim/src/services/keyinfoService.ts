// src/services/keyinfoService.ts
import api from "../services/api";
import type { Project } from "../types/keyinfoTypes";

export const fetchKeyInfoAPI = async (): Promise<Project[]> => {
    const response = await api.get("/deployment/status/stream");
    const rawProjects = response.data?.data?.projects;

    if (!Array.isArray(rawProjects)) {
        throw new Error("projects는 배열이어야 합니다.");
    }

    return rawProjects;
};
