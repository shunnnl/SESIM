import api from "../services/api";
import type { Project } from "../types/keyinfoTypes";
import axios from "axios";  // axios가 직접 사용되는 경우 추가

export const fetchKeyInfoAPI = async (): Promise<Project[]> => {
    try {
        // 방법 1: 타임아웃 증가 및 responseType 설정
        const response = await api.get("/deployment/status/stream", {
            timeout: 30000,  // 30초로 타임아웃 증가
            responseType: 'json',
            headers: {
                'Accept-Encoding': 'identity'  // 압축 비활성화로 청크 인코딩 문제 줄임
            }
        });

        // 데이터 구조 검증을 더 세밀하게
        const data = response.data;

        if (!data || !data.data || !Array.isArray(data.data.projects)) {
            console.error("잘못된 응답 구조:", data);
            throw new Error("유효한 프로젝트 데이터를 찾을 수 없습니다.");
        }

        return data.data.projects;
    } catch (error) {
        // 오류 상세 정보 로깅
        if (axios.isAxiosError(error)) {
            console.error("API 오류:", {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data
            });

            // 특정 오류에 대한 재시도 로직
            if (error.code === 'ERR_INCOMPLETE_CHUNKED_ENCODING') {
                console.log("청크 인코딩 오류 감지, 재시도...");
                // 재귀적으로 한 번만 재시도
                return fetchKeyInfoAPI();
            }
        }
        throw error;
    }
};

// 방법 2: 스트림 응답용 대체 함수 (필요한 경우)
export const fetchKeyInfoStreamAPI = async (): Promise<Project[]> => {
    // Fetch API를 사용하여 스트림 처리
    const response = await fetch(`${api.defaults.baseURL}/deployment/status/stream`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            // 인증 헤더 등이 필요한 경우 추가
        }
    });

    if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data?.projects || !Array.isArray(data.data.projects)) {
        throw new Error("유효한 프로젝트 데이터를 찾을 수 없습니다.");
    }

    return data.data.projects;
};