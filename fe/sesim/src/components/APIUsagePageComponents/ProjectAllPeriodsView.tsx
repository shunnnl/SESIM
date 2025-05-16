import { motion } from "framer-motion";
import { LuActivity, LuCircleDollarSign, LuWallet, LuClock, LuGlobe, LuFileChartColumnIncreasing } from "react-icons/lu";
import DailyCostChart from "./graph/DailyCostChart";
import MonthlyTotalAPIChart from "./graph/MonthlyTotalAPIChart";
import MonthlyTotalCostChart from "./graph/MonthlyTotalCostChart";

interface ProjectAllPeriodsViewProps {
  projectName: string;
}

export const ProjectAllPeriodsView: React.FC<ProjectAllPeriodsViewProps> = ({ projectName, data }) => {
  return (
    <div className="flex flex-col">
      {/* 통계 정보 */}
      <div className="flex flex-col my-[16px] gap-4">
        <div className="flex flex-row gap-4 w-full">
          <motion.div
            className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-1">
              <div>
                <p className="text-sm font-medium text-gray-300">{`${projectName}의 총 비용`}</p>
              </div>
              <p className="text-2xl font-bold text-white">$ {data.allCost}</p>
            </div>
            <div className="h-full justify-start">
              <div className="w-[28px] h-[28px] rounded-[14px] bg-[#5F9FED] flex items-center justify-center">
                <LuWallet
                  size={18}
                  color="#242B3A"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex flex-col gap-1">
              <div>
                <p className="text-sm font-medium text-gray-300">{`${projectName}의 총 API 요청 수`}</p>
              </div>
              <p className="text-2xl font-bold text-white">{data.allRequestCount} <span className="text-sm text-medium text-gray-400">건</span></p>
            </div>
            <div className="h-full justify-start">
              <div className="w-[28px] h-[28px] rounded-[14px] bg-[#88D6BE] flex items-center justify-center">
                <LuActivity size={18} color="#242B3A" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex flex-col gap-1">
              <div>
                <p className="text-sm font-medium text-gray-300">{`${projectName}의 사용 시간`}</p>
              </div>
              <p className="text-2xl font-bold text-white">{data.allSeconds} <span className="text-sm text-medium text-gray-400">h</span></p>
            </div>
            <div className="h-full justify-start">
              <div className="w-[28px] h-[28px] rounded-[14px] bg-[#837CF7] flex items-center justify-center">
                <LuClock
                  size={18}
                  color="#242B3A"
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-row gap-4">
          {/* 최근 3개월 전체 비용 추이 그래프 */}
          <motion.div
            className="flex flex-col gap-4 bg-[#1D2433] rounded-[16px] w-full px-[16px] py-[16px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex flex-row gap-3 items-center">
              <div className="w-[24px] h-[24px] rounded-[12px] bg-[#101820] flex items-center justify-center">
                <LuCircleDollarSign
                  size={16}
                  color="#DEDEDE"
                />
              </div>
              <p className="text-md font-semibold text-left text-[#DEDEDE]">{`${projectName}의 최근 3개월 전체 비용 추이`}</p>
            </div>
            <MonthlyTotalCostChart data={data.allCostForThreeMonths} />
          </motion.div>

          {/* 최근 3개월 전체 API 요청 수 추이 그래프 */}
          <motion.div
            className="flex flex-col gap-4 bg-[#1D2433] rounded-[16px] w-full px-[16px] py-[16px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="flex flex-row gap-3 items-center">
              <div className="w-[24px] h-[24px] rounded-[12px] bg-[#101820] flex items-center justify-center">
                <LuGlobe
                  size={16}
                  color="#DEDEDE"
                />
              </div>
              <p className="text-md font-semibold text-left text-[#DEDEDE]">{`${projectName}의 최근 3개월 전체 API 요청 수 추이`}</p>
            </div>
            <MonthlyTotalAPIChart data={data.allRequestCountForThreeMonths} />
          </motion.div>
        </div>

        {/* 최근 3개월 동안 비용 일일 누적합 그래프 */}
        <motion.div
          className="flex flex-col gap-4 bg-[#1D2433] rounded-[16px] w-full px-[16px] py-[16px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="flex flex-row gap-3 items-center">
            <div className="w-[24px] h-[24px] rounded-[12px] bg-[#101820] flex items-center justify-center">
              <LuFileChartColumnIncreasing
                size={16}
                color="#DEDEDE"
              />
            </div>
            <p className="text-md font-semibold text-left text-[#DEDEDE]">{`${projectName}의 최근 3개월 동안 비용 일일 누적합 그래프`}</p>
          </div>
          <DailyCostChart data={data.allCostForThreeMonthsVerDaily} />
        </motion.div>
      </div>
    </div>
  );
};