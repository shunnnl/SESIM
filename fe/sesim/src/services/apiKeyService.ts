import api from "./api";

interface ApiKeyRequest {
    projectId: number;
    modelId: number;
}

interface ApiKeyResponse {
    success: boolean;
    data: {
        apiKey: string;
    };
    error: string | null;
}

import { AxiosError } from 'axios';

// API Key를 가져오는 함수
export const fetchApiKey = async ({ projectId, modelId }: ApiKeyRequest): Promise<string> => {
    try {
        const response = await api.post("/deployment/apikey", {
            projectId,
            modelId
        });

        const data: ApiKeyResponse = response.data;

        if (data.success) {
            return data.data.apiKey;  // API Key 반환
        } else {
            throw new Error(data.error || "API Key fetch 실패");
        }
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            // AxiosError일 때, 오류 응답과 메시지를 출력
            console.error("AxiosError: ", error.response?.data || error.message);
        } else if (error instanceof Error) {
            // 일반 Error 객체일 때
            console.error("General Error: ", error.message);
        } else {
            // 그 외의 오류 처리 (unknown 타입에 대한 처리)
            console.error("Unknown Error: ", JSON.stringify(error, null, 2));
        }
        throw error;  // 에러를 다시 던져서 호출한 곳에서 처리하도록 합니다.
    }
};
