import api from "./api";

export const getAiModels = async () => {
    const response = await api.get("/model/features");
    
    return response.data;
};

export const getAiModelDetail = async (modelId: number) => {
    const response = await api.get(`/model/${modelId}`);

    return response.data;
};

export const getSdkExampleCode = async () => {
    const response = await api.get("/model/sdk-download-code");
    return response.data;
};
