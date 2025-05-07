import api from "./api";

export const getRoleArns = async () => {
    const response = await api.get("/iam/my-arns");

    return response.data;
};

export const getDeployOptions = async () => {
    const response = await api.get("/deployment/options");
    
    return response.data;
};



