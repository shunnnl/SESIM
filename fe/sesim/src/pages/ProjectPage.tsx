import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Sidebar } from "../components/Sidebar";
import { Project } from "../types/ProjectTypes";
import useDeploymentStateSSE from '../hooks/projectStateSSE';
import KeyinfoItemList from "../components/KeyInfoPageComponents/KeyInfoListItem";

export const ProjectPage = () => {
    useDeploymentStateSSE();

    const { loading, error, projects } = useSelector((state: RootState) => state.keyinfo);

    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
            <div className="mr-12">
                <Sidebar />
            </div>

            <div
                className="absolute top-[40%] right-[30%] -translate-y-1/2 w-[50px] h-[50px] rounded-full"
                style={{
                    background: "#00215A",
                    boxShadow: "0 0 160px 120px #00215A, 0 0 320px 240px #00215A",
                    opacity: 0.4,
                    zIndex: 0
                }}
            ></div>

            <motion.div
                className="flex flex-col flex-1 p-6 mt-4"
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
                    <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        키 정보
                    </h1>

                    <p className="text-lg font-medium m-1">
                        AI모델 별 API 키 정보를 제공합니다.
                    </p>

                    <p className="text-lg font-medium m-1 mb-10">
                        API 키는 최초 1회만 확인 가능하며, 보안상의 이유로 이후에는 다시 확인하실 수 없습니다.
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
                                className="mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                            >
                                <pre>{JSON.stringify(project, null, 2)}</pre>
                                {/* FIXME - 연동된 데이터를 확인하기 위해 작성 삭제될 예정 */}
                                <KeyinfoItemList project={project} />
                            </motion.div>
                        );
                    })
                ) : (
                    <p>생성된 프로잭트가 없습니다.</p>
                )}
            </motion.div>
        </div>
    );
};
