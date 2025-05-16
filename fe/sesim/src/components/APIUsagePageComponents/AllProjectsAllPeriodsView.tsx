import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { LuActivity, LuCircleDollarSign, LuWallet, LuClock, LuCloudCog, LuGlobe, LuListFilter } from "react-icons/lu";
import { RootState } from "../../store";
// import DailyCostChart from "./graph/DailyCostChart";
import MonthlyTotalAPIChart from "./graph/MonthlyTotalAPIChart";
import MonthlyTotalCostChart from "./graph/MonthlyTotalCostChart";
import DailyCostChartByProjects from "./graph/DailyCostChartByProjects";
import AllCostDonutChartPerProjects from "./graph/AllCostDonutChartPerProjects";

export const AllProjectsAllPeriodsView: React.FC = () => {
  const allProjectsAllPeriodsData = useSelector((state: RootState) => state.apiUsage.allProjectsAllPeriodsData);

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
              <p className="text-sm font-medium text-gray-300">총 비용</p>
              <p className="text-2xl font-bold text-white">$ {allProjectsAllPeriodsData?.totalCost ?? 0}</p>
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
              <p className="text-sm font-medium text-gray-300">총 API 요청 수</p>
              <p className="text-2xl font-bold text-white">{allProjectsAllPeriodsData?.totalRequests ?? 0} <span className="text-sm text-medium text-gray-400">건</span></p>
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
              <p className="text-sm font-medium text-gray-300">총 사용 시간</p>
              <p className="text-2xl font-bold text-white">{allProjectsAllPeriodsData?.totalSeconds ?? 0} <span className="text-sm text-medium text-gray-400">h</span></p>
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

          <motion.div
            className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-300">총 프로젝트 수</p>
              <p className="text-2xl font-bold text-white">{allProjectsAllPeriodsData?.totalProjectCount ?? 0} <span className="text-sm text-medium text-gray-400">개</span></p>
            </div>
            <div className="h-full justify-start">
              <div className="w-[28px] h-[28px] rounded-[14px] bg-[#EC5A69] flex items-center justify-center">
                <LuCloudCog
                  size={18}
                  color="#242B3A"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* 프로젝트 별 총 비용 추이 그래프 */}
        <div className="gap-4 grid grid-cols-8">
          <div className="flex flex-col col-span-2 gap-4 bg-[#1D2433] rounded-[16px] w-full px-[16px] py-[16px]">
            <div className="flex flex-row gap-3 items-center">
              <div className="w-[24px] h-[24px] rounded-[12px] bg-[#101820] flex items-center justify-center">
                <LuCircleDollarSign
                  size={16}
                  color="#DEDEDE"
                />
              </div>
              <p className="text-md font-semibold text-left text-[#DEDEDE]">프로젝트 별 비용 추이</p>
            </div>
            <AllCostDonutChartPerProjects data={allProjectsAllPeriodsData?.projectCosts ?? []} />
          </div>

          {/* 최근 3개월 전체 비용 추이 그래프 */}
          <motion.div
            className="flex flex-col col-span-3 gap-4 bg-[#1D2433] rounded-[16px] w-full px-[16px] py-[16px]"
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
              <p className="text-md font-semibold text-left text-[#DEDEDE]">최근 3개월 전체 비용 추이</p>
            </div>
            <MonthlyTotalCostChart data={allProjectsAllPeriodsData?.monthProjectCosts ?? []} />
          </motion.div>

          {/* 최근 3개월 전체 API 요청 수 추이 그래프 */}
          <motion.div
            className="flex flex-col col-span-3 gap-4 bg-[#1D2433] rounded-[16px] w-full px-[16px] py-[16px]"
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
              <p className="text-md font-semibold text-left text-[#DEDEDE]">최근 3개월 전체 API 요청 수 추이</p>
            </div>
            <MonthlyTotalAPIChart data={allProjectsAllPeriodsData?.monthProjectRequests ?? []} />
          </motion.div>
        </div>

        {/* 최근 3개월 동안 비용 일일 그래프 */}
        {/* <motion.div
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
            <p className="text-md font-semibold text-left text-[#DEDEDE]">최근 3개월 동안의 총 비용 일일 그래프</p>
          </div>
          <DailyCostChart data={allProjectsAllPeriodsData?.dailyProjectCosts ?? []} />
        </motion.div> */}

        {/* 프로젝트별 일일 비용 그래프 (새로 추가) */}
        <motion.div
          className="flex flex-col gap-4 bg-[#1D2433] rounded-[16px] w-full px-[16px] py-[16px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <div className="flex flex-row gap-3 items-center">
            <div className="w-[24px] h-[24px] rounded-[12px] bg-[#101820] flex items-center justify-center">
              <LuListFilter
                size={16}
                color="#DEDEDE"
              />
            </div>
            <p className="text-md font-semibold text-left text-[#DEDEDE]">프로젝트별 일일 비용 추이 그래프</p>
          </div>
          <DailyCostChartByProjects data={allProjectsAllPeriodsData?.dailyProjectCosts ?? []} />
        </motion.div>
      </div>
    </div>
  );
};