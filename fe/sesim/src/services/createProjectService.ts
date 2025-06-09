import api from "./api";

interface VerifyRoleArnRequest {
    roleArn: string;
}

export const getRoleArns = async () => {
    const response = await api.get("/iam/my-arns");

    return response.data;
};

export const verifyRoleArn = async (data: VerifyRoleArnRequest) => {
    const response = await api.post("/iam/verify-role", data);

    return response.data;
};

export const getDeployOptions = async () => {
    const response = await api.get("/deployment/options");
    
    return response.data;
};

export const createProject = async (projectInfo: any) => {
    const response = await api.post("/deployment/terraform", projectInfo);

    return response.data;
};