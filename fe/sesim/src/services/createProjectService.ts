import api from "./api";

export const getDeployOptions = async () => {
    const response = await api.get("/deployment/options");
    return response.data;
};



