import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAPIUsageProjects } from "../store/APIUsageSlice";
import { APIUsageProject } from "../types/APIUsageTypes";
import { EventSourcePolyfill } from "event-source-polyfill";

export const useAPIUsageSSE = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.warn("SSE 연결 실패: 토큰이 없습니다.");
            return;
        }

        const url = "http://52.79.149.27/api/deployment/projects/usage/stream";
        const eventSource = new EventSourcePolyfill(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        eventSource.onopen = () => {
            console.log("SSE 연결이 성공적으로 열렸습니다.");
        };

        eventSource.onmessage = (event) => {
            try {
                const parsed: { projects: APIUsageProject[] } = JSON.parse(event.data);
                dispatch(updateAPIUsageProjects(parsed.projects)); 
            } catch (e) {
                console.error("SSE 메시지 파싱 실패", e);
            }
        };

        eventSource.onerror = (err) => {
            if (err instanceof ErrorEvent) {
                console.error("SSE 연결 오류", err);
                // 이곳에서 status 속성은 직접 접근할 수 없으므로 eventSource 객체를 통해 확인
                console.error("EventSource 상태:", eventSource.readyState);
            } else {
                console.error("알 수 없는 오류 발생", err);
            }
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [dispatch]);
};
