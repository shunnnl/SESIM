import api from "./api";

interface DeploymentApiKeyRequest {
    projectId: number;
    modelId: number;
}

export const createDeploymentApiKey = async (data: DeploymentApiKeyRequest) => {
    const response = await api.post("/deployment/apikey", data);
    console.log("API Key created:", response);
    console.log("API Key created:", response.data);
    return response.data.data.apiKey;
};