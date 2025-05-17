import { motion } from "framer-motion";
import Lottie from "react-lottie-player";
import { useState, useRef, useEffect } from "react";
import { LuFilter, LuClock, LuChevronDown } from "react-icons/lu";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import { Tabbar } from "../components/common/Tabbar";
import { useAPIUsageData } from "../hooks/useAPIUsageData";
import { CostChangeInfo, CostChangeStatus } from "../types/APIUsageTypes";
import { AllProjectsAllPeriodsView } from "../components/APIUsagePageComponents/AllProjectsAllPeriodsView";
import { AllProjectMonthPeriodView } from "../components/APIUsagePageComponents/AllProjectMonthPeriodView";
import { SpecificProjectAllPeriodsView } from "../components/APIUsagePageComponents/SpecificProjectAllPeriodView";
import { SpecificProjectMonthPeriodView } from "../components/APIUsagePageComponents/SpecificProjectMonthPeriodView";
import pageLoading from "../assets/lotties/page-loading-gray.json";

interface MonthOption {
    value: string;
    label: string;
}

const ChangeIndicator = ({ status }: { status: CostChangeStatus }) => {
    if (status === "UP") {
        return <FiTrendingUp className="text-green-500" size={12} />;
    } else if (status === "DOWN") {
        return <FiTrendingDown className="text-red-500" size={12} />;
    } else {
        return <FiMinus className="text-gray-500" size={8} />;
    }
};


const getChangeBackgroundStyle = (status: CostChangeStatus) => {
    switch (status) {
        case 'UP': return 'bg-green-300/10 border-green-500/10';
        case 'DOWN': return 'bg-red-300/10 border-red-500/10';
        default: return 'bg-gray-300/10 border-gray-500/10';
    }
};


const StatItem = ({ label, value, suffix, changeInfo }: { label: string, value: string, suffix: string, changeInfo: CostChangeInfo }) => {
    return (
        <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm font-normal text-gray-400 whitespace-nowrap truncate">{label}</p>
            <div className="flex flex-row gap-2 items-center justify-start">
                <p className="text-4xl font-medium text-white whitespace-nowrap truncate">
                    {value}{suffix}
                </p>
                <div className={`flex flex-row gap-2 rounded-full p-1 border ${getChangeBackgroundStyle(changeInfo.status)}`}>
                    <ChangeIndicator status={changeInfo.status} />
                </div>
            </div>
        </div >
    );
};


export const APIUsagePage: React.FC = () => {
    const { isInitLoading, currentMonthCost, currentMonthRequests, currentMonthSeconds, costChangeInfo, requestChangeInfo, secondsChangeInfo, projectInfo, selectedProject, selectedProjectName, selectedMonth, selectedMonthName, monthOptions, handleSelectProject, handleSelectMonth } = useAPIUsageData();

    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isMonthOpen, setIsMonthOpen] = useState(false);

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


    const onSelectProject = (value: string) => {
        handleSelectProject(value);
        setIsProjectOpen(false);
    };


    const onSelectMonth = (value: string) => {
        handleSelectMonth(value);
        setIsMonthOpen(false);
    };


    const renderContent = () => {
        if (selectedMonth === "all" && selectedProject === "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AllProjectsAllPeriodsView />
                </motion.div>
            );
        } else if (selectedMonth === "all" && selectedProject !== "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <SpecificProjectAllPeriodsView projectId={selectedProject} />
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject === "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AllProjectMonthPeriodView month={selectedMonth}/>
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject !== "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <SpecificProjectMonthPeriodView projectId={selectedProject} month={selectedMonth}/>
                </motion.div>
            );
        }
    };


    useEffect(() => {
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


    if (isInitLoading) {
        return (
            <div className="flex min-h-screen text-white container-padding justify-center items-center">
                <Lottie 
                    animationData={pageLoading} 
                    play 
                    loop 
                    style={{ width: "150px", height: "150px" }} 
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen text-white">
            <Tabbar />

            {/* 컨텐츠 영역 */}
            <motion.div
                className="flex flex-col my-[44px] w-full container-padding"
                style={{ zIndex: 1 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
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
                            API 사용 대시보드
                        </motion.h1>

                        <motion.p
                            className="text-sm font-medium text-gray-400 whitespace-nowrap truncate"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            API 호출 사용량 리포트를 제공합니다.<br />
                            정량화된 사용 데이터를 기반으로 보안 모델 운영을 효율화하세요.
                        </motion.p>
                    </div>

                    {/* 통계량 영역 */}
                    <div className="flex flex-row items-center gap-8">

                        {/* 이번달 비용 */}
                        <StatItem
                            label="이번달 비용"
                            value={`$${currentMonthCost.toString()}`}
                            suffix=""
                            changeInfo={costChangeInfo}
                        />

                        {/* API 요청 수 */}
                        <StatItem
                            label="이번달 API 요청 수"
                            value={`${currentMonthRequests.toString()}회`}
                            suffix=""
                            changeInfo={requestChangeInfo}
                        />

                        {/* 사용 시간 */}
                        <StatItem
                            label="이번달 사용 시간"
                            value={`${currentMonthSeconds.toString()}h`}
                            suffix=""
                            changeInfo={secondsChangeInfo}
                        />
                    </div>
                </div>

                <div className="w-full h-[1px] bg-white/20 my-2"></div>

                {/* 필터 */}
                <div className="flex flex-row items-end pt-2">
                    <div className="flex flex-row gap-3">
                        {/* 프로젝트 선택 */}
                        <div
                            className="relative flex items-center gap-1 px-4 py-1 rounded-[16px]"
                            ref={projectDropdownRef}
                        >
                            <LuFilter
                                className="text-[#DEDEDE]"
                                size={18}
                            />
                            <div className="relative">
                                <button
                                    onClick={() => clickProjectFilter()}
                                    className="flex items-center mx-2 gap-2 justify-between text-[#DEDEDE] cursor-pointer focus:outline-none whitespace-nowrap truncate"
                                >
                                    <span>{selectedProjectName}</span>
                                    <LuChevronDown
                                        className={`transition-transform duration-200 ${isProjectOpen ? "rotate-180" : ""}`}
                                        size={16}
                                    />
                                </button>

                                {isProjectOpen && (
                                    <div className="absolute top-full mt-2 w-full min-w-[130px] bg-[#242B3A] rounded-[10px] border border-[rgba(62,72,101,0.4)] shadow-lg z-50 overflow-hidden">
                                        <div className="max-h-[240px] overflow-y-auto scrollbar-custom">
                                            <div
                                                className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer whitespace-nowrap truncate
                                                            ${selectedProject === "all" ? "bg-[rgba(255,255,255,0.1)] font-medium" : "text-[#DEDEDE]"}`}
                                                onClick={() => onSelectProject("all")}
                                            >
                                                모든 프로젝트
                                            </div>
                                            {projectInfo && projectInfo.map((project) => (
                                                <div
                                                    key={project.projectId}
                                                    className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer whitespace-nowrap
                                                                ${selectedProject === project.projectId.toString() ? "bg-[rgba(255,255,255,0.1)] font-medium" : "text-[#DEDEDE]"}`}
                                                    onClick={() => onSelectProject(project.projectId.toString())}
                                                >
                                                    {project.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 기간 선택 */}
                        <div
                            className="flex items-center gap-1 px-4 py-2 rounded-[16px]"
                            ref={monthDropdownRef}
                        >
                            <LuClock
                                className="text-[#DEDEDE]"
                                size={18}
                            />
                            <div className="relative">
                                <button
                                    onClick={() => clickMonthFilter()}
                                    className="flex items-center mx-2 gap-2 justify-between text-[#DEDEDE] cursor-pointer focus:outline-none whitespace-nowrap truncate"
                                >
                                    <span>{selectedMonthName}</span>
                                    <LuChevronDown
                                        className={`transition-transform duration-200 ${isMonthOpen ? "rotate-180" : ""}`}
                                        size={16}
                                    />
                                </button>

                                {isMonthOpen && (
                                    <div className="absolute top-full mt-2 w-full min-w-[120px] bg-[#242B3A] rounded-[10px] border border-[rgba(62,72,101,0.4)] shadow-lg z-50">
                                        <div className="max-h-[240px] overflow-y-auto scrollbar-custom">
                                            {monthOptions.map((month: MonthOption) => (
                                                <div
                                                    key={month.value}
                                                    className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer whitespace-nowrap
                                                                ${selectedMonth === month.value ? "bg-[rgba(255,255,255,0.1)] font-medium" : "text-[#DEDEDE]"}`}
                                                    onClick={() => onSelectMonth(month.value)}
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
    );
};
