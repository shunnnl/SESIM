import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Sidebar } from "../components/Sidebar";
import { Project } from "../types/ProjectTypes";
import useDeploymentStateSSE from '../hooks/projectStateSSE';
import KeyinfoItemList from "../components/ProjectPageComponents/ProjectListItem";

export const ProjectPage = () => {
    useDeploymentStateSSE();

    const { loading, error, projects } = useSelector((state: RootState) => state.keyinfo);

    return (
        <div className="flex min-h-screen text-white container-padding">
            <div>
                <Sidebar />
            </div>

            <div className="my-[44px] ml-[44px] w-full h-full">
                <motion.div
                    className="flex flex-col flex-1"
                    style={{ zIndex: 1 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-xl font-semibold flex items-center mb-1">
                            프로젝트
                        </h1>

                        <p className="text-sm font-medium text-gray-400 mb-5">
                            생성한 프로젝트의 상세 정보를 확인하세요.
                        </p>
                    </motion.div>

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
                        projects.slice().reverse().map((project: Project, index: number) => {
                            return (
                                <motion.div
                                    key={index}
                                    className="mb-5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                                >
                                    <KeyinfoItemList project={project} />
                                </motion.div>
                            );
                        })
                    ) : (
                        <p>생성된 프로잭트가 없습니다.</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
