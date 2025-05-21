import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Project } from "../types/ProjectTypes";
import { Tabbar } from "../components/common/Tabbar";
import useDeploymentStateSSE from '../hooks/projectStateSSE';
import KeyinfoItemList from "../components/ProjectPageComponents/ProjectListItem";

export const ProjectPage = () => {
    useDeploymentStateSSE();

    const { loading, error, projects } = useSelector((state: RootState) => state.keyinfo);
    const sortedProjects = [...projects].sort((a, b) => b.projectId - a.projectId);

    return (
        <div className="flex flex-col min-h-screen text-white">
            <Tabbar />

            {/* 컨텐츠 영역 */}
            <div className="flex flex-col my-[44px] w-full container-padding">
                <div className="w-full h-full">

                    {/* 타이틀 영역 */}
                    <div className="flex flex-row content-center justify-between gap-[24px] py-4">
                        {/* 제목 */}
                        <div className="flex flex-col content-end justify-end gap-2">
                            <motion.h1
                                className="text-2xl font-semibold flex items-center mb-1 whitespace-nowrap truncate"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                프로젝트
                            </motion.h1>

                            <motion.p
                                className="text-sm font-medium text-gray-400 whitespace-nowrap truncate"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                서비스 연동 및 보안관리를 위한 정보를 제공합니다.<br />승인 IP, ALB 주소, AI 모델별 대시보드, API Key를 확인할 수 있습니다.
                            </motion.p>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-white/20 my-2 mb-6"></div>

                    <motion.div
                        className="flex flex-col flex-1"
                        style={{ zIndex: 1 }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p>Loading...</p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="text-red-500">{error}</p>
                            </motion.div>
                        )}

                        {Array.isArray(projects) && projects.length > 0 ? (
                            sortedProjects.slice().map((project: Project, index: number) => {
                                return (
                                    <motion.div
                                        key={index}
                                        className="mb-8"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                                    >
                                        <KeyinfoItemList project={project} index={index} />
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p>생성된 프로잭트가 없습니다.</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
