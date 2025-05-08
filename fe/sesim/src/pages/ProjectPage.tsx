import { motion } from "framer-motion";
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
    {/*FIXME api연동시 받아올 리스트 입니다! 그라파나 링크는 그냥 내정보링크로 들어있습니다 클릭시 이동만 구현됨*/ }


    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
            <div className="mr-12">
                <Sidebar />
            </div>

            {/* 배경 빛 효과 */}
            <div
                className="absolute top-[45%] right-[30%] -translate-y-1/2 w-[50px] h-[50px] rounded-full -z-10"
                style={{
                    background: "#00215A",
                    boxShadow: "0 0 160px 120px #00215A, 0 0 320px 240px #00215A",
                    opacity: 0.4,
                    zIndex: 0
                }}
            ></div>

            {/* 메인 콘텐츠에 애니메이션 적용 */}
            <motion.div
                className="flex flex-col flex-1 p-6 mt-4"
                style={{ zIndex: 1 }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        대시보드
                    </h1>
                    <p className="text-lg font-medium m-1 mb-7">
                        프로젝트에 사용된 보안 AI별 시각화 대시보드를 제공합니다.
                    </p>
                </motion.div>

                {/* 각 프로젝트 그룹 등장 애니메이션 */}
                {allItems.map((itemsArray, index) => (
                    <motion.div
                        key={index}
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                    >
                        <h2 className="text-2xl font-semibold text-white mb-3">
                            sesim project
                        </h2>
                        <ProjectItemList items={itemsArray} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};