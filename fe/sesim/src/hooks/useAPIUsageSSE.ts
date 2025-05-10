import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateProjectStatusAsync } from "../store/keyinfoSlice";
import { AppDispatch } from "../store";
import { EventSourcePolyfill } from "event-source-polyfill";

export const useDeploymentStateSSE = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.warn("SSE 연결 실패: 토큰이 없습니다.");
            return;
        }

        const url = "http://52.79.149.27/api/deployment/status";
        const eventSource = new EventSourcePolyfill(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        eventSource.onopen = () => {
            console.log("배포 상태 SSE 연결됨");
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                dispatch(updateProjectStatusAsync({
                    projectId: data.projectStatus.projectId,
                    steps: data.projectStatus.steps,
                }));
            } catch (e) {
                console.error("SSE 메시지 파싱 실패", e);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE 연결 오류", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [dispatch]);
};
