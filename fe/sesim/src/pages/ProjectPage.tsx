import { Sidebar } from "../components/Sidebar";
import ProjectItemList from "../components/ProjectPageComponents/ProjectListItem";

export const ProjectPage = () => {
    const allItems = [
        [
            {
                id: 1,
                modelName: "AuthGaurd",
                description: "비정상적 로그인 패턴을 감지",
                link: "http://localhost:5173/userinfo",
            },
            {
                id: 2,
                modelName: "DataWatch",
                description: "비정상적 로그인 패턴을 감지",
                link: "http://localhost:5173/userinfo",
            },
            {
                id: 3,
                modelName: "WebSentinel",
                description: "비정상적 로그인 패턴을 감지",
                link: "http://localhost:5173/userinfo",
            }
        ],
        [
            {
                id: 4,
                modelName: "FileGuard",
                description: "비정상적 로그인 패턴을 감지",
                link: "http://localhost:5173/userinfo",
            },
            {
                id: 5,
                modelName: "CloudWatch",
                description: "비정상적 로그인 패턴을 감지",
                link: "http://localhost:5173/userinfo",
            },
            {
                id: 6,
                modelName: "NetworkSentinel",
                description: "비정상적 로그인 패턴을 감지",
                link: "http://localhost:5173/userinfo",
            }
        ]
    ];
    {/*FIXME api연동시 받아올 리스트 입니다! 그라파나 링크는 그냥 내정보링크로 들어있습니다 클릭시 이동만 구현됨됨*/ }

    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
            <div className="mr-12">
                <Sidebar />
            </div>

            <div
                className="absolute top-[45%] right-[30%] -translate-y-1/2 w-[50px] h-[50px] rounded-full -z-10"
                style={{
                    background: "#00235D",
                    boxShadow: "0 0 160px 120px #00235D, 0 0 320px 240px #00235D",
                    opacity: 0.4,
                    zIndex: 0
                }}
            ></div>

            <div
                className="flex flex-col flex-1 p-6 mt-4"
                style={{ zIndex: 1 }}>
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        프로젝트
                    </h1>
                    <p className="text-lg font-medium m-1 mb-7">
                        프로젝트에 사용된 보안 AI별 시각화 대시보드를 제공합니다.
                    </p>
                </div>
                <div>
                    {allItems.map((itemsArray, index) => (
                        <div key={index} className="mb-8">
                            <h2 className="text-2xl font-semibold text-white mb-3">
                                sesim project
                                {/*FIXME 프로젝트 이름도 api연동시 받아서 보여줘야할 데이터입니다*/}
                            </h2>
                            <ProjectItemList items={itemsArray} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
