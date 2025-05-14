import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { LuFilter, LuClock, LuChevronDown } from "react-icons/lu";
import { Sidebar } from "../components/Sidebar";
import { APIUsageProject } from "../types/APIUsageTypes";
import { getAPIUsage } from "../services/apiUsageService";
import { ProjectAllPeriodsView } from "../components/APIUsagePageComponents/ProjectAllPeriodsView";
import { AllProjectsMonthlyView } from "../components/APIUsagePageComponents/AllProjectsMonthlyView";
import { AllProjectsAllPeriodsView } from "../components/APIUsagePageComponents/AllProjectsAllPeriodsView";
import { getMonthOptionsByCreatedAtFunc, getAllProjectsAllPeriodsData, AllProjectsAllPeriodsData, getProjectAllPeriodsData, ProjectAllPeriodsData } from "../store/APIUsageSlice";

interface MonthOption {
    value: string;
    label: string;
}

export const APIUsagePage: React.FC = () => {
    const [projects, setProjects] = useState<APIUsageProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
    const [allProjectsAllPeriodsData, setAllProjectsAllPeriodsData] = useState<AllProjectsAllPeriodsData | null>(null);
    const [projectAllPeriodsData, setProjectAllPeriodsData] = useState<ProjectAllPeriodsData | null>(null);
    const projectDropdownRef = useRef<HTMLDivElement>(null);
    const monthDropdownRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clickProjectFilter = () => {
        setIsProjectOpen(!isProjectOpen)
        setIsMonthOpen(false)
    }


    const clickMonthFilter = () => {
        setIsMonthOpen(!isMonthOpen)
        setIsProjectOpen(false)
    }


    const handleSelectProject = (value: string) => {
        setSelectedProject(value);
        setIsProjectOpen(false);
        setProjectAllPeriodsData(getProjectAllPeriodsData(projects, parseInt(selectedProject)));
    };


    const handleSelectMonth = (value: string) => {
        setSelectedMonth(value);
        setIsMonthOpen(false);
    };


    const getSelectedProjectName = () => {
        if (selectedProject === "all") return "모든 프로젝트";
        const project = projects.find(p => p.projectId.toString() === selectedProject);
        return project?.projectName || "모든 프로젝트";
    };


    const getSelectedMonthLabel = () => {
        const month = monthOptions.find(m => m.value === selectedMonth);
        return month?.label || "전체 기간";
    };


    const renderContent = () => {
        if (selectedMonth === "all" && selectedProject === "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AllProjectsAllPeriodsView data={allProjectsAllPeriodsData} />
                </motion.div>
            );
        } else if (selectedMonth === "all" && selectedProject !== "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProjectAllPeriodsView projectName={getSelectedProjectName()} data={projectAllPeriodsData} />
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject === "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AllProjectsMonthlyView month={getSelectedMonthLabel()} />
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject !== "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AllProjectsMonthlyView month={getSelectedMonthLabel()} />
                </motion.div>
            );
        }
    };


    const getAPIUsageData = async () => {
        setIsLoading(true);

        try {
            const data = await getAPIUsage();

            if (data.success) {
                console.log(data.data.projects);
                setProjects(data.data.projects);
                setMonthOptions(getMonthOptionsByCreatedAtFunc(data.data.userCreatedAt));
                setAllProjectsAllPeriodsData(getAllProjectsAllPeriodsData(data.data.projects));
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        getAPIUsageData();

        const handleClickOutside = (event: MouseEvent) => {
            if (
                projectDropdownRef.current &&
                !projectDropdownRef.current.contains(event.target as Node) &&
                monthDropdownRef.current &&
                !monthDropdownRef.current.contains(event.target as Node)
            ) {
                setIsProjectOpen(false);
                setIsMonthOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    if (isLoading) {
        return (
            <div className="flex min-h-screen text-white container-padding">
                <div>
                    <Sidebar />
                </div>
                <div>
                    {/* TODO: 로딩 애니메이션 적용하기 */}
                    로딩중..
                </div>
            </div>
        )
    }


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
                    {/* 제목 */}
                    <motion.h1
                        className="text-xl font-semibold flex items-center mb-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        API 사용 대시보드
                    </motion.h1>

                    <motion.p
                        className="text-sm font-medium text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        API 호출 이력과 비용 청구 내역을 기준으로 프로젝트 단위의 사용 리포트를 제공합니다.<br />
                        정량화된 사용 데이터를 기반으로 보안 모델 운영을 효율화하세요.
                    </motion.p>

                    {/* 필터 */}
                    <div className="flex flex-row items-center justify-between mt-4 px-4 py-1 bg-[#1D2433] rounded-[16px]">
                        <div className="flex flex-row">
                            {/* 프로젝트 선택 */}
                            <div
                                className="relative flex items-center gap-3 px-2 py-2"
                                ref={projectDropdownRef}
                            >
                                <LuFilter
                                    className="text-[#DEDEDE]"
                                    size={18}
                                />
                                <div className="relative">
                                    <button
                                        onClick={() => clickProjectFilter()}
                                        className="flex items-center gap-2 min-w-[150px] justify-between text-[#DEDEDE] cursor-pointer focus:outline-none"
                                    >
                                        <span>{getSelectedProjectName()}</span>
                                        <LuChevronDown
                                            className={`transition-transform duration-200 ${isProjectOpen ? "rotate-180" : ""}`}
                                            size={16}
                                        />
                                    </button>

                                    {isProjectOpen && (
                                        <div className="absolute top-full -left-4 mt-2 w-full min-w-[180px] bg-[#242B3A] rounded-[10px] border border-[rgba(62,72,101,0.4)] shadow-lg z-50 overflow-hidden">
                                            <div className="max-h-[240px] overflow-y-auto scrollbar-custom">
                                                <div
                                                    className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer 
                                                        ${selectedProject === "all" ? "bg-[rgba(255,255,255,0.1)] font-medium" : "text-[#DEDEDE]"}`}
                                                    onClick={() => handleSelectProject("all")}
                                                >
                                                    모든 프로젝트
                                                </div>
                                                {projects.map((project: APIUsageProject) => (
                                                    <div
                                                        key={project.projectId}
                                                        className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer 
                                                            ${selectedProject === project.projectId.toString() ? "bg-[rgba(255,255,255,0.1)] font-medium" : "text-[#DEDEDE]"}`}
                                                        onClick={() => handleSelectProject(project.projectId.toString())}
                                                    >
                                                        {project.projectName}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 월 선택 */}
                            <div
                                className="flex items-center gap-3 pl-6 py-2"
                                ref={monthDropdownRef}
                            >
                                <LuClock className="text-[#DEDEDE]" size={18} />
                                <div className="relative">
                                    <button
                                        onClick={() => clickMonthFilter()}
                                        className="flex items-center gap-2 min-w-[150px] justify-between text-[#DEDEDE] cursor-pointer focus:outline-none"
                                    >
                                        <span>{getSelectedMonthLabel()}</span>
                                        <LuChevronDown
                                            className={`transition-transform duration-200 ${isMonthOpen ? "rotate-180" : ""}`}
                                            size={16}
                                        />
                                    </button>

                                    {isMonthOpen && (
                                        <div className="absolute top-full -left-4 mt-2 w-full min-w-[180px] bg-[#242B3A] rounded-[10px] border border-[rgba(62,72,101,0.4)] shadow-lg z-50 overflow-hidden">
                                            <div className="max-h-[240px] overflow-y-auto scrollbar-custom">
                                                {monthOptions.map((month: MonthOption) => (
                                                    <div
                                                        key={month.value}
                                                        className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer 
                                                            ${selectedMonth === month.value ? "bg-[rgba(255,255,255,0.1)] font-medium" : "text-[#DEDEDE]"}`}
                                                        onClick={() => handleSelectMonth(month.value)}
                                                    >
                                                        {month.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 컨텐츠 영역 */}
                    {renderContent()}
                </motion.div>
            </div>
        </div>
    );
};
