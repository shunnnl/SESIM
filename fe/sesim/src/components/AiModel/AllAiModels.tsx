import { AiModelCard } from "./AiModelCard";
import globalImage from "../../assets/images/global.png";

const allAiModels = [
    {
        modelName: "AuthGuard",
        modelDescription: "비정상 로그인 패턴을 감지",
        modelDetailList: ["로그인 시도", "위치 이상", "시간대 이상", "MFA 실패"]
    },
    {
        modelName: "DataWatch",
        modelDescription: "내부 데이터 조회 및 다운로드 이상행동 감지",
        modelDetailList: ["민감 정보", "과도한 조회", "비정상 다운로드"]
    },
    {
        modelName: "WebSentinel",
        modelDescription: "웹 요청에서 해킹 시도와 접근 식별",
        modelDetailList: ["URL 접근", "웹쉘", "SQL 인젝션"]
    },
    {
        modelName: "NetPulse",
        modelDescription: "이상 트래픽과 시스템 공격을 실시간 추적",
        modelDetailList: ["DDos", "포트 스캔", "트래픽 급증"]
    },
    {
        modelName: "EndPointEye",
        modelDescription: "엔드포인트에서의 수상한 활동 탐지",
        modelDetailList: ["프로세스 실행", "파일리스 공격", "권한 상승"]
    },
    {
        modelName: "EndPointEye",
        modelDescription: "엔드포인트에서의 수상한 활동 탐지",
        modelDetailList: ["프로세스 실행", "파일리스 공격", "권한 상승"]
    }
]

export const AllAiModels = () => {
    return (
        <div className="mt-[88px] mb-[300px] text-white">
            <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold text-center">다양한 보안AI 모델을 찾아보세요</h1>

            <div className="relative w-full max-w-[1200px] mx-auto my-[88px]">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[150px] rounded-full"
                    style={{
                        background: "#112F5D", 
                        boxShadow: "0 0 160px 120px #112F5D, 0 0 320px 240px #112F5D",
                        opacity: 0.4,
                        zIndex: 1
                    }}
                ></div>
                <img
                    src={globalImage}
                    alt="global"
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 object-cover z-10"
                />
                <div className="relative z-20 grid grid-cols-2 lg:grid-cols-3 gap-8">
                    {allAiModels.map((model) => (
                        <AiModelCard key={model.modelName} {...model} />
                    ))}
                </div>
            </div>
            
            
        </div>  
    );
};
