import { motion } from "framer-motion";
import { IconType } from "react-icons/lib";
import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import { LuFilter, LuClock, LuChevronDown, LuChartColumnIncreasing, LuFolder } from "react-icons/lu";
import { useAPIUsageData } from "../hooks/useAPIUsageData";
import { CostChangeInfo, CostChangeStatus } from "../types/APIUsageTypes";
import { AllProjectsAllPeriodsView } from "../components/APIUsagePageComponents/AllProjectsAllPeriodsView";

interface MonthOption {
    value: string;
    label: string;
}

interface SidebarNavItemProps {
    to: string;
    icon: IconType;
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
                    {/* <ProjectAllPeriodsView projectName={getSelectedProjectName()} data={projectAllPeriodsData ?? null} /> */}
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject === "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* <AllProjectsMonthlyView month={getSelectedMonthLabel()} /> */}
                </motion.div>
            );
        } else if (selectedMonth !== "all" && selectedProject !== "all") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* <AllProjectsMonthlyView month={getSelectedMonthLabel()} /> */}
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
            <div className="flex min-h-screen text-white container-padding">
                <div>
                    {/* TODO: 로딩 애니메이션 적용하기 */}
                    로딩중..
                </div>
            </div>
        )
    }

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
                            value={currentMonthRequests.toString()}
                            suffix=""
                            changeInfo={requestChangeInfo}
                        />

                        {/* 사용 시간 */}
                        <StatItem
                            label="이번달 사용 시간"
                            value={currentMonthSeconds.toString()}
                            suffix="h"
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
                                                    className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer whitespace-nowrap truncate
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
                                    <div className="absolute top-full mt-2 w-full min-w-[120px] bg-[#242B3A] rounded-[10px] border border-[rgba(62,72,101,0.4)] shadow-lg z-50 overflow-hidden">
                                        <div className="max-h-[240px] overflow-y-auto scrollbar-custom">
                                            {monthOptions.map((month: MonthOption) => (
                                                <div
                                                    key={month.value}
                                                    className={`px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer whitespace-nowrap truncate
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
