import { motion } from "framer-motion";
import { ReactNode } from "react";

// 공통 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: ReactNode;
  bgColor: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, suffix = "", icon, bgColor, delay = 0 }) => (
  <motion.div
    className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
  >
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
  </motion.div>
);

// 공통 차트 컨테이너 컴포넌트
interface ChartContainerProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
  colSpan?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, icon, children, delay = 0, colSpan = "w-full" }) => (
  <motion.div
    className={`flex flex-col gap-4 bg-[#1D2433] rounded-[16px] ${colSpan} px-[16px] py-[16px]`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    <div className="flex flex-row gap-3 items-center">
      <div className="w-[24px] h-[24px] rounded-[12px] bg-[#101820] flex items-center justify-center">
        {icon}
      </div>
      <p className="text-md font-semibold text-left text-[#DEDEDE]">{title}</p>
    </div>
    {children}
  </motion.div>
); 