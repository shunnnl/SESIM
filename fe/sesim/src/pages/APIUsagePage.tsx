import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Sidebar } from "../components/Sidebar";
import { useAPIUsageSSE } from "../hooks/useAPIUsageSSE";
import { APIUsageListItem } from "../components/APIUsagePageComponents/APIUsageListItem";

export const APIUsagePage: React.FC = () => {
    const projects = useSelector((state: RootState) => state.apiUsage.projects);

    useAPIUsageSSE();

    return (
        <div className="flex min-h-screen text-white container-padding">
            <div>
                <Sidebar />
            </div>

            <motion.div
                className="flex flex-col flex-1 p-6 mt-4"
                style={{ zIndex: 1 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <motion.h1
                    className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    API사용량 / 금액
                </motion.h1>

                <motion.p
                    className="text-lg font-medium m-1 mb-7"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    API 호출 이력과 비용 청구 내역을 기준으로 프로젝트 단위의 사용 리포트를 제공합니다.<br />
                    정량화된 사용 데이터를 기반으로 보안 모델 운영을 효율화하세요.
                </motion.p>

                { projects.slice().reverse().map((project) => (
                    <motion.div
                        key={project.projectId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mb-6"
                    >
                        <pre>{JSON.stringify(project, null, 2)}</pre>
                        {/* //FIXME - 데이터 연동 확인을 위해 작성된 코드임 이후 삭제될예정 */}
                        <APIUsageListItem
                            data={{
                                projectName: project.projectName,
                                usageTime: project.projectTotalSeconds / 3600,
                                totalCost: `$${project.projectTotalCost.toFixed(2)}`,
                                totalApiRequests: project.projectTotalRequestCount,
                                modelCosts: project.models.map((model) => ({
                                    modelName: model.modelName,
                                    cost: `$${model.totalCost.toFixed(2)}`,
                                    usageTime: model.totalSeconds / 3600,
                                    apiRequests: model.totalRequestCount,
                                })),
                            }}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
