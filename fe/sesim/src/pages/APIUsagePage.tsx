import { Sidebar } from "../components/Sidebar";
import { APIUsageListItem } from "../components/APIUsagePageComponents/APIUsageListItem";

export const APIUsagePage: React.FC = () => {
    const projectData = {
        projectName: "sesim project",
        usageTime: "10h",
        totalCost: "$3000",
        totalApiRequests: 500,
        modelCosts: [
            {
                modelName: "AuthGuard",
                cost: "$1000",
                usageTime: "5h",
                apiRequests: 250,
            },
            {
                modelName: "DataWatch",
                cost: "$1000",
                usageTime: "3h",
                apiRequests: 150,
            },
            {
                modelName: "WebSentinel",
                cost: "$1000",
                usageTime: "2h",
                apiRequests: 100,
            },
        ],
    };
    {/*FIXME api연동시 삭제될 리스트트*/}

    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
            <div className="mr-12">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 p-6 mt-4">
                <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    API사용량 / 금액
                </h1>
                <p className="text-lg font-medium m-1 mb-7">
                    API 호출 이력과 비용 청구 내역을 기준으로 프로젝트 단위의 사용 리포트를 제공합니다.<br />
                    정량화된 사용 데이터를 기반으로 보안 모델 운영을 효율화하세요.
                </p>
                <APIUsageListItem data={projectData} />
            </div>
        </div>
    );
};