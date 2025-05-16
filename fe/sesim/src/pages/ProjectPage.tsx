import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Project } from "../types/ProjectTypes";
import useDeploymentStateSSE from '../hooks/projectStateSSE';
import KeyinfoItemList from "../components/ProjectPageComponents/ProjectListItem";
import { LuChartColumnIncreasing } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { NavLink } from "react-router-dom";

interface SidebarNavItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon: Icon, label }) => {
    return (
        <div>
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-t-2xl transition duration-200 text-sm
                    ${isActive ? "bg-[#04101D] font-semibold text-white" : "font-medium text-gray-400 hover:bg-[#04101D]"}`
                }
            >
                {({ isActive }) => (
                    <>
                        <div className="flex-1 flex items-center gap-3">
                            <Icon className={`text-xl ${isActive ? "text-white" : "text-gray-400"}`} />
                            {label}
                        </div>
                    </>
                )}
            </NavLink>
        </div>
    );
};

export const ProjectPage = () => {
    useDeploymentStateSSE();

    const { loading, error, projects } = useSelector((state: RootState) => state.keyinfo);

    return (
        <div className="flex flex-col min-h-screen text-white">
            {/* 탭바 */}
            <div className="w-full bg-[#1D2433]">
                <div className="flex flex-row container-padding content-end justify-between pt-2 pd-1">
                    {/* 네비게이션 메뉴 */}
                    <div className="flex flex-row items-center gap-5">
                        <SidebarNavItem
                            to="/apiusage"
                            icon={LuChartColumnIncreasing}
                            label="API 사용 대시보드"
                        >
                        </SidebarNavItem>
                        <SidebarNavItem
                            to="/project"
                            icon={LuFolder}
                            label="프로젝트"
                        />
                    </div>

                    {/* 사용자 정보 */}
                    <div className="flex flex-row items-center gap-3">
                        <div className="text-sm font-medium text-gray-400">
                            {localStorage.getItem("email")}
                        </div>
                    </div>
                </div>
            </div>

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
                                서비스 연동 및 보안관리를 위한 정보를 제공합니다.<br/>승인 IP, ALB 주소, AI 모델별 대시보드, API Key를 확인할 수 있습니다.
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
                            projects.slice().reverse().map((project: Project, index: number) => {
                                return (
                                    <motion.div
                                        key={index}
                                        className="mb-8"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                                    >
                                        <KeyinfoItemList project={project} index={index}/>
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
