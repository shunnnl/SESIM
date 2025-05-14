import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { LuFilter, LuClock, LuChevronDown } from "react-icons/lu";
import { Sidebar } from "../components/Sidebar";
import { APIUsageProject } from "../types/APIUsageTypes";
import { AllProjectsPeriodView } from "../components/APIUsagePageComponents/AllProjectsPeriodView";

// 더미 데이터
export const dummyProjects: APIUsageProject[] = [
    {
        projectId: 1,
        projectName: "SSAFY 프로젝트",
        projectTotalRequestCount: 1500,
        projectTotalSeconds: 7200,
        projectTotalCost: 150.5,
        models: [
            {
                modelId: 1,
                modelName: "GPT-4",
                totalRequestCount: 800,
                totalSeconds: 3600,
                hourlyRate: 0.03,
                totalCost: 80.5
            },
            {
                modelId: 2,
                modelName: "GPT-3.5",
                totalRequestCount: 700,
                totalSeconds: 3600,
                hourlyRate: 0.02,
                totalCost: 70.0
            }
        ]
    },
    {
        projectId: 2,
        projectName: "삼성전자 AI 프로젝트",
        projectTotalRequestCount: 2500,
        projectTotalSeconds: 10800,
        projectTotalCost: 250.75,
        models: [
            {
                modelId: 1,
                modelName: "GPT-4",
                totalRequestCount: 1500,
                totalSeconds: 7200,
                hourlyRate: 0.03,
                totalCost: 150.75
            },
            {
                modelId: 3,
                modelName: "Claude",
                totalRequestCount: 1000,
                totalSeconds: 3600,
                hourlyRate: 0.025,
                totalCost: 100.0
            }
        ]
    },
    {
        projectId: 3,
        projectName: "현대자동차 챗봇",
        projectTotalRequestCount: 3000,
        projectTotalSeconds: 14400,
        projectTotalCost: 350.25,
        models: [
            {
                modelId: 2,
                modelName: "GPT-3.5",
                totalRequestCount: 2000,
                totalSeconds: 10800,
                hourlyRate: 0.02,
                totalCost: 200.25
            },
            {
                modelId: 3,
                modelName: "Claude",
                totalRequestCount: 1000,
                totalSeconds: 3600,
                hourlyRate: 0.025,
                totalCost: 150.0
            }
        ]
    },
    {
        projectId: 4,
        projectName: "현대자동차 챗봇2",
        projectTotalRequestCount: 3000,
        projectTotalSeconds: 14400,
        projectTotalCost: 350.25,
        models: [
            {
                modelId: 2,
                modelName: "GPT-3.5",
                totalRequestCount: 2000,
                totalSeconds: 10800,
                hourlyRate: 0.02,
                totalCost: 200.25
            },
            {
                modelId: 3,
                modelName: "Claude",
                totalRequestCount: 1000,
                totalSeconds: 3600,
                hourlyRate: 0.025,
                totalCost: 150.0
            }
        ]
    },
    {
        projectId: 5,
        projectName: "현대자동차 챗봇3",
        projectTotalRequestCount: 3000,
        projectTotalSeconds: 14400,
        projectTotalCost: 350.25,
        models: [
            {
                modelId: 2,
                modelName: "GPT-3.5",
                totalRequestCount: 2000,
                totalSeconds: 10800,
                hourlyRate: 0.02,
                totalCost: 200.25
            },
            {
                modelId: 3,
                modelName: "Claude",
                totalRequestCount: 1000,
                totalSeconds: 3600,
                hourlyRate: 0.025,
                totalCost: 150.0
            }
        ]
    },
    {
        projectId: 6,
        projectName: "현대자동차 챗봇4",
        projectTotalRequestCount: 3000,
        projectTotalSeconds: 14400,
        projectTotalCost: 350.25,
        models: [
            {
                modelId: 2,
                modelName: "GPT-3.5",
                totalRequestCount: 2000,
                totalSeconds: 10800,
                hourlyRate: 0.02,
                totalCost: 200.25
            },
            {
                modelId: 3,
                modelName: "Claude",
                totalRequestCount: 1000,
                totalSeconds: 3600,
                hourlyRate: 0.025,
                totalCost: 150.0
            }
        ]
    }
];

interface MonthOption {
    value: string;
    label: string;
}

export const APIUsagePage: React.FC = () => {
    // const projects = useSelector((state: RootState) => state.apiUsage.projects);
    const projects = dummyProjects; // 더미 데이터 사용
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
    const projectDropdownRef = useRef<HTMLDivElement>(null);
    const monthDropdownRef = useRef<HTMLDivElement>(null);

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


    // 최근 6개월 데이터 생성
    const generateMonths = (): MonthOption[] => {
        const months: MonthOption[] = [
            {
                value: "all",
                label: "전체 기간"
            }
        ];
        const today = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                value: date.toISOString().slice(0, 7),
                label: `${date.getFullYear()}년 ${date.getMonth() + 1}월`
            });
        }
        return months;
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
                    <AllProjectsPeriodView />
                </motion.div>
            );
        } else if (selectedMonth === "all" && selectedProject !== "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject === "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject !== "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                </motion.div>
            );
        }
    };


    useEffect(() => {
        setMonthOptions(generateMonths());

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
