import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { EventSourcePolyfill } from "event-source-polyfill";

export const useAPIUsageSSE = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.warn("SSE 연결 실패: 토큰이 없습니다.");
            return;
        }

        const url = "http://52.79.149.27/api/deployment/api-usage/stream";

        const createEventSource = () => {
            console.log("📡 API Usage SSE 연결 시도...");
            const eventSource = new EventSourcePolyfill(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                heartbeatTimeout: 10 * 60 * 1000,
            });


            eventSource.onopen = () => {
                console.log("✅ API Usage SSE 연결 성공");
            };


            eventSource.onmessage = (event) => {
                console.log("📨 일반 메시지 수신:", event.data);
                try {
                    const data = JSON.parse(event.data);
                    console.log("📦 파싱된 일반 데이터:", data);

                    if (data.eventType === "INIT" && Array.isArray(data.projects)) {
                        console.log("✅ INIT: 프로젝트 사용량 초기화 완료");
                    } else if (data.eventType === "USAGE_UPDATE" && Array.isArray(data.projects)) {
                        console.log("✅ USAGE_UPDATE: 프로젝트 사용량 업데이트 완료");
                    }
                } catch (e) {
                    console.error("❌ 일반 메시지 파싱 오류", e);
                }
            };


            eventSource.addEventListener("INIT", (event: any) => {
                console.log("📨 INIT 이벤트 수신:", event.data);
                try {
                    const parsed = JSON.parse(event.data);
                    if (Array.isArray(parsed.projects)) {
                        console.log("✅ INIT 이벤트: 사용량 데이터 초기화 완료");
                    }
                } catch (e) {
                    console.error("❌ INIT 이벤트 파싱 오류", e);
                }
            });


            eventSource.addEventListener("USAGE_UPDATE", (event: any) => {
                console.log("📨 USAGE_UPDATE 이벤트 수신:", event.data);
                try {
                    const parsed = JSON.parse(event.data);
                    if (Array.isArray(parsed.projects)) {
                        console.log("✅ USAGE_UPDATE 이벤트: 사용량 업데이트 완료");
                    }
                } catch (e) {
                    console.error("❌ USAGE_UPDATE 이벤트 파싱 오류", e);
                }
            });


            eventSource.addEventListener("connect", (event: any) => {
                console.log("📨 connect 이벤트 수신:", event.data);
            });


            eventSource.onerror = (err) => {
                console.error("⚠️ SSE 오류 발생", err);
                eventSource.close();
                console.log("🔄 5초 후 SSE 재연결 시도");
                setTimeout(createEventSource, 5000);
            };
            return eventSource;
        };

        const eventSource = createEventSource();

        return () => {
            eventSource.close();
            console.log("🔌 SSE 연결 종료");
        };
    }, [dispatch]);
};