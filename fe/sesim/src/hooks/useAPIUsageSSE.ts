import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAPIUsageProjects } from "../store/APIUsageSlice";
import { EventSourcePolyfill } from "event-source-polyfill";

export const useAPIUsageSSE = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.warn("SSE 연결 실패: 토큰이 없습니다.");
            return;
        }

        const url = "http://52.79.149.27/api/deployment/projects/usage";

        let eventSource: EventSourcePolyfill | null = null;

        const connectSSE = () => {
            console.log("📡 SSE 연결 시도...");
            eventSource = new EventSourcePolyfill(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            eventSource.onopen = () => {
                console.log("✅ SSE 연결 성공");
            };

            eventSource.onmessage = (event) => {
                console.log("📨 기본 이벤트 메시지:", event.data);
                try {
                    const parsed = JSON.parse(event.data);
                    console.log("📨 파싱된 기본 데이터:", parsed);
                    
                    if (Array.isArray(parsed)) {
                        dispatch(updateAPIUsageProjects(parsed));
                    } 
                    else if (parsed.projects && Array.isArray(parsed.projects)) {
                        dispatch(updateAPIUsageProjects(parsed.projects));
                    }
                } catch (e) {
                    console.error("❌ SSE 메시지 파싱 실패", e);
                }
            };

            eventSource.addEventListener("INIT", (event: any) => {
                console.log("📨 INIT 이벤트 수신:", event.data);
                try {
                    const parsed = JSON.parse(event.data);
                    console.log("📨 파싱된 INIT 데이터:", parsed);
                    
                    if (Array.isArray(parsed)) {
                        dispatch(updateAPIUsageProjects(parsed));
                    }
                } catch (e) {
                    console.error("❌ INIT 이벤트 파싱 실패", e);
                }
            });

            eventSource.addEventListener("connect", (event: any) => {
                console.log("📨 연결 확인 메시지:", event.data);
            });

            eventSource.onerror = (err) => {
                console.error("⚠️ SSE 연결 오류", err);
                if (eventSource) {
                    eventSource.close();
                }
                console.log("🔄 5초 후 SSE 재연결 시도");
                setTimeout(connectSSE, 5000);
            };
        };

        connectSSE();

        return () => {
            if (eventSource) {
                console.log("🔌 SSE 연결 종료");
                eventSource.close();
            }
        };
    }, [dispatch]);
};