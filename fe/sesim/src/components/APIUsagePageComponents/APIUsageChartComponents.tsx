import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ChartContainerSkeleton, StatCardSkeleton } from "../common/SkeletonLoader";
import { CostComparisonIndicator } from "./CostComparisonIndicator";

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: ReactNode;
  bgColor: string;
  delay?: number;
  isLoading?: boolean;
};

interface StatCardIndicatorProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: ReactNode;
  bgColor: string;
  delay?: number;
  isLoading?: boolean;
  currentCost: number;
  previousCost: number;
};


export const StatCard: React.FC<StatCardProps> = ({ title, value, suffix = "", icon, bgColor, delay = 0, isLoading}) => (
  <motion.div
    className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    {isLoading ? (
      <StatCardSkeleton />
    ) : (
      <>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-gray-300 truncate whitespace-nowrap">{title}</p>
          <p className="text-2xl font-bold text-white">
            {value} {suffix && <span className="text-sm text-medium text-gray-400">{suffix}</span>}
          </p>
        </div>
        <div className="h-full justify-start">
          <div 
            className="w-[28px] h-[28px] rounded-[14px] flex items-center justify-center" 
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </div>
        </div>
      </>
    )}
  </motion.div>
);


export const StatCardIndicator: React.FC<StatCardIndicatorProps> = ({ title, value, suffix = "", icon, bgColor, delay = 0, isLoading, currentCost, previousCost }) => (
  <motion.div
    className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    {isLoading ? (
      <StatCardSkeleton />
    ) : (
      <>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-300 truncate whitespace-nowrap">{title}</p>
          <div className="flex flex-row gap-2 items-center">
            <p className="text-2xl font-bold text-white gap-2">
              {value} {suffix && <span className="text-sm text-medium text-gray-400">{suffix}</span>}
            </p>
            {currentCost !== undefined && previousCost !== undefined && (
              <CostComparisonIndicator
              currentCost={currentCost}
              previousCost={previousCost}
              showPercentage={true}
              />
            )}
          </div>
        </div>
        <div className="h-full justify-start">
          <div 
            className="w-[28px] h-[28px] rounded-[14px] flex items-center justify-center" 
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </div>
        </div>
      </>
    )}
  </motion.div>
);


interface ChartContainerProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
  colSpan?: string;
  isLoading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, icon, children, delay = 0, colSpan = "w-full", isLoading = false }) => (
  <motion.div
    className={`flex flex-col gap-4 bg-[#1D2433] rounded-[16px] ${colSpan} px-[16px] py-[16px]`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    {isLoading ? (
      <ChartContainerSkeleton />
    ) : (
      <>
        <div className="flex flex-row gap-3 items-center">
          <div className="w-[24px] h-[24px] rounded-[12px] bg-[#101820] flex items-center justify-center">
            {icon}
          </div>
          <p className="text-md font-semibold text-left text-[#DEDEDE]">{title}</p>
        </div>
        {children}
      </>
    )}
  </motion.div>
);


interface ProjectCardProps {
  projectId: number;
  projectName: string;
  cost: number;
  requestCount: number;
  seconds: number;
  index: number;
}


export const ProjectCostCard: React.FC<ProjectCardProps> = ({
  projectId,
  projectName,
  cost,
  requestCount,
  seconds,
  index
}) => {
  const colors = ["#5F9FED", "#88D6BE", "#837CF7", "#EC5A69", "#F59E0B", "#10B981"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="flex flex-col bg-[#1D2433] rounded-[16px] p-[16px] gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * index }}
    >
      <div className="flex flex-row justify-between items-center">
        <p className="text-md font-semibold text-white">{projectName || `프로젝트 ${projectId}`}</p>
        <div
          className="w-[10px] h-[10px] rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm font-medium text-gray-400">비용</p>
        <p className="text-md font-semibold text-white">$ {cost.toLocaleString()}</p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm font-medium text-gray-400">API 요청 수</p>
        <p className="text-md font-semibold text-white">{requestCount.toLocaleString()} 건</p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm font-medium text-gray-400">사용 시간</p>
        <p className="text-md font-semibold text-white">{seconds.toLocaleString()} h</p>
      </div>
    </motion.div>
  );
};