import { Sidebar } from "../components/Sidebar";
import ItemList from "../components/ProjectPageComponents/ProjectListItem";

export const ProjectPage = () => {
    const allItems = [
        [
            {
                id: 1,
                modelName: "AuthGaurd",
                description: "비정상적 로그인 패턴을 감지",
                link: "",
            },
            {
                id: 2,
                modelName: "DataWatch",
                description: "비정상적 로그인 패턴을 감지",
                link: "",
            },
            {
                id: 3,
                modelName: "WebSentinel",
                description: "비정상적 로그인 패턴을 감지",
                link: "",
            }
        ],
        [
            {
                id: 4,
                modelName: "FileGuard",
                description: "비정상적 로그인 패턴을 감지",
                link: "",
            },
            {
                id: 5,
                modelName: "CloudWatch",
                description: "비정상적 로그인 패턴을 감지",
                link: "",
            },
            {
                id: 6,
                modelName: "NetworkSentinel",
                description: "비정상적 로그인 패턴을 감지",
                link: "",
            }
        ]
    ];

    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black">
            <div className="mr-12">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 p-6 mt-4">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        프로젝트
                    </h1>
                    <p className="text-lg font-medium m-1 mb-7">
                        프로젝트 AI별 <br/>시각화 대시보드를 제공합니다.
                    </p>
                </div>
                <div>
                    {allItems.map((itemsArray, index) => (
                        <div key={index} className="mb-6">
                            <h2 className="text-2xl font-semibold text-white mb-3">
                                sesim project
                            </h2>
                            <ItemList items={itemsArray} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
