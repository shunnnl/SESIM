import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { LuActivity, LuTrendingUp, LuWallet } from "react-icons/lu";
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

            <div className="my-[48px] ml-[48px] w-full h-full">
                <motion.div
                    className="flex flex-col flex-1"
                    style={{ zIndex: 1 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.h1
                        className="text-2xl font-semibold flex items-center mb-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        API 사용량 / 금액
                    </motion.h1>

                    <motion.p
                        className="text-md font-medium text-[#DEDEDE]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        API 호출 이력과 비용 청구 내역을 기준으로 프로젝트 단위의 사용 리포트를 제공합니다.<br />
                        정량화된 사용 데이터를 기반으로 보안 모델 운영을 효율화하세요.
                    </motion.p>

                    <div className="flex flex-col my-[32px] gap-6">
                        <div className="flex flex-row gap-6 w-full">
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">
                                <div className="w-[52px] h-[52px] rounded-[32px] bg-[#5F9FED] flex items-center justify-center">
                                    <LuActivity
                                        size={28}
                                        color="#242B3A"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-[#DEDEDE]">전체 API 사용량</p>
                                    <p className="text-2xl font-bold text-white">250</p>
                                </div>
                            </div>
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">
                                <div className="w-[52px] h-[52px] rounded-[32px] bg-[#88D6BE] flex items-center justify-center">
                                    <LuWallet
                                        size={28}
                                        color="#242B3A"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-[#DEDEDE]">전체 비용</p>
                                    <p className="text-2xl font-bold text-white">$100.12</p>
                                </div>
                            </div>
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">
                                <div className="w-[52px] h-[52px] rounded-[32px] bg-[#837CF7] flex items-center justify-center">
                                    <LuTrendingUp
                                        size={28}
                                        color="#242B3A"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-[#DEDEDE]">최대 비용 프로젝트</p>
                                    <p className="text-2xl font-bold text-white">Sesim</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row gap-6">
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-[#DEDEDE]">AI 모델별 API 사용량 비교</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">

                            </div>
                        </div>

                        {projects.slice().reverse().map((project) => (
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
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
