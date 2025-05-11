import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { EventSourcePolyfill } from "event-source-polyfill";
import { AppDispatch } from "../store";
import { setAllProjects, updateProjectStatus } from "../store/keyinfoSlice";

const useDeploymentStateSSE = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn("SSE 연결 실패: 토큰이 없습니다.");
            return;
        }

        const url = 'http://52.79.149.27/api/deployment/status/stream';

        const createEventSource = () => {
            console.log("📡 SSE 연결 시도...");
            const eventSource = new EventSourcePolyfill(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            eventSource.onopen = () => {
                console.log("✅ SSE 연결 성공");
            };

            eventSource.onmessage = (event) => {
                console.log("📨 일반 메시지 수신:", event.data);
                try {
                    const data = JSON.parse(event.data);
                    console.log("파싱된 일반 데이터:", data);
                    
                    if (data.eventType === 'INIT') {
                        dispatch(setAllProjects(data.projectList));
                    } else if (data.eventType === 'STATUS_UPDATE') {
                        dispatch(updateProjectStatus({
                            projectId: data.projectStatus.projectId,
                            steps: data.projectStatus.steps,
                        }));
                    }
                } catch (err) {
                    console.error("❌ SSE 메시지 파싱 오류", err);
                }
            };

            eventSource.addEventListener("INIT", (event: any) => {
                console.log("📨 INIT 이벤트 수신:", event.data);
                try {
                    const projectList = JSON.parse(event.data);
                    console.log("파싱된 INIT 데이터:", projectList);
                    if (Array.isArray(projectList)) {
                        dispatch(setAllProjects(projectList));
                        console.log("✅ 프로젝트 목록 업데이트 완료 (" + projectList.length + "개)");
                    }
                } catch (err) {
                    console.error("❌ INIT 이벤트 파싱 오류", err);
                }
            });

            eventSource.addEventListener("STATUS_UPDATE", (event: any) => {
                console.log("📨 STATUS_UPDATE 이벤트 수신:", event.data);
                try {
                    const projectStatus = JSON.parse(event.data);
                    console.log("파싱된 STATUS_UPDATE 데이터:", projectStatus);
                    
                    if (projectStatus && projectStatus.projectId) {
                        dispatch(updateProjectStatus({
                            projectId: projectStatus.projectId,
                            steps: projectStatus.steps,
                        }));
                        console.log("✅ 프로젝트 상태 업데이트 완료 (ID: " + projectStatus.projectId + ")");
                    }
                } catch (err) {
                    console.error("❌ STATUS_UPDATE 이벤트 파싱 오류", err);
                }
            });

            eventSource.addEventListener("connect", (event: any) => {
                console.log("📨 connect 이벤트 수신:", event.data);
            });

            eventSource.onerror = (err) => {
                console.error("⚠️ SSE 연결 오류", err);
                eventSource.close();
                console.log("🔄 SSE 연결 끊어짐. 5초 후 재연결 시도...");
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

export default useDeploymentStateSSE;