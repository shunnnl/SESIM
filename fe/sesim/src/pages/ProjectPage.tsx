import { useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Sidebar } from "../components/Sidebar";
import { RootState, AppDispatch } from "../store/index"; 
import { fetchProjectList } from "../store/projectSlice";  
import ProjectItemList from "../components/ProjectPageComponents/ProjectListItem";

export const ProjectPage = () => {
    const dispatch = useDispatch<AppDispatch>(); 

    const { projects, loading, error } = useSelector((state: RootState) => state.project);

    useEffect(() => {
        dispatch(fetchProjectList());
    }, [dispatch]);

    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
            <div className="mr-12">
                <Sidebar />
            </div>

            <div
                className="absolute top-[45%] right-[30%] -translate-y-1/2 w-[50px] h-[50px] rounded-full -z-10"
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

                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}

                {projects.slice().reverse().map((project, index) => (
                    <motion.div
                        key={index}
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                    >
                        <h2 className="text-2xl font-semibold text-white mb-3">
                            <span>
                                {project.name}
                                <p className="text-lg font-normal inline ml-3">{project.description}</p>
                            </span>
                        </h2>
                        <ProjectItemList items={project.models} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};