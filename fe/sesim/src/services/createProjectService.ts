import api from "./api";

export const getRoleArns = async () => {
    const response = await api.get("/iam/my-arns");

    return response.data;
};

export const verifyRoleArn = async (arn: string) => {
    const response = await api.post("/iam/verify-role", { arn });

    return response.data;
};

export const getDeployOptions = async () => {
    const response = await api.get("/deployment/options");
    
    return response.data;
};



