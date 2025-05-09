import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateProjectStatusAsync } from '../store/keyinfoSlice'; // 비동기 액션 사용
import { AppDispatch } from '../store';

const deploymentStateSSE = () => {
  const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const eventSource = new EventSource('http://52.79.149.27/api/deployment/status'); // 전체 URL로 설정

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // 실시간 데이터 받아서 프로젝트 상태 업데이트 (비동기 액션 호출)
            dispatch(updateProjectStatusAsync({   // 액션을 디스패치
                projectId: data.projectStatus.projectId,
                steps: data.projectStatus.steps,
            })); 
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

export default deploymentStateSSE;
