import { useSelector } from "react-redux";
import { LuActivity, LuCircleDollarSign, LuWallet, LuClock, LuGlobe, LuFileChartColumnIncreasing } from "react-icons/lu";
import { RootState } from "../../store";
import { useProjectNames } from "../../utils/projectModelUtils";
import MonthProjectAPIChart from "./AllPjtMonthPrd/MonthProjectAPIChart";
import MonthProjectCostChart from "./AllPjtMonthPrd/MonthProjectCostChart";
import DailyAllProjectAPIChart from "./AllPjtMonthPrd/DailyAllProjectAPIChart";
import DailyAllProjectCostChart from "./AllPjtMonthPrd/DailyAllProjectCostChart";
import DailyAllProjectSecondChart from "./AllPjtMonthPrd/DailyAllProjectSecondChart";
import { ChartContainer, StatCardIndicator, ProjectCostCard } from "./APIUsageChartComponents";

export const AllProjectMonthPeriodView: React.FC<{ month: string }> = ({ month }) => {
  const isLoading = useSelector((state: RootState) => state.apiUsage.isAllProjectsMonthPeriodLoading);
  const allProjectsMonthPeriodData = useSelector((state: RootState) => state.apiUsage.allProjectsMonthPeriodData);

  const monthName = month.slice(2,4) + "년 " + month.slice(6, 7) + "월 ";
  const projectNames = useProjectNames();

  const statCards = [
    {
      title: `${monthName} 총 비용`,
      value: `$ ${allProjectsMonthPeriodData?.curMonthTotalCost ?? 0}`,
      icon: <LuWallet size={18} color="#242B3A" />,
      bgColor: "#5F9FED",
      delay: 0,
      isLoading: isLoading,
      currentCost: allProjectsMonthPeriodData?.curMonthTotalCost ?? 0,
      previousCost: allProjectsMonthPeriodData?.lastMonthTotalCost ?? 0,
    },
    {
      title: `${monthName} 총 API 요청 수`,
      value: allProjectsMonthPeriodData?.curMonthTotalRequests ?? 0,
      suffix: "건",
      icon: <LuActivity size={18} color="#242B3A" />,
      bgColor: "#88D6BE",
      delay: 0.1,
      isLoading: isLoading,
      currentCost: allProjectsMonthPeriodData?.curMonthTotalRequests ?? 0,
      previousCost: allProjectsMonthPeriodData?.lastMonthTotalRequests ?? 0,
    },
    {
      title: `${monthName} 총 사용 시간`,
      value: allProjectsMonthPeriodData?.curMonthTotalSeconds ?? 0,
      suffix: "h",
      icon: <LuClock size={18} color="#242B3A" />,
      bgColor: "#837CF7",
      delay: 0.2,
      isLoading: isLoading,
      currentCost: allProjectsMonthPeriodData?.curMonthTotalSeconds ?? 0,
      previousCost: allProjectsMonthPeriodData?.lastMonthTotalSeconds ?? 0,
    }
  ];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col my-[16px] gap-4">
        {/* 통계 정보 */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          {statCards.map((card, index) => (
            <StatCardIndicator
              key={index}
              title={card.title}
              value={card.value}
              suffix={card.suffix}
              icon={card.icon}
              bgColor={card.bgColor}
              delay={card.delay}
              currentCost={card.currentCost}
              previousCost={card.previousCost}
            />
          ))}
        </div>

        <div className="gap-4 grid grid-cols-1 lg:grid-cols-4">
          {/* 프로젝트 별 전체 비용 추이 그래프 */}
          <ChartContainer
            title={`${monthName}의 프로젝트별 비용 비교`}
            icon={<LuCircleDollarSign size={16} color="#DEDEDE" />}
            colSpan="flex flex-col lg:col-span-1"
            isLoading={isLoading}
          >
            <MonthProjectCostChart data={allProjectsMonthPeriodData?.projectCosts ?? []} />
          </ChartContainer>

          {/* 비용 일일 그래프 */}
          <ChartContainer
            title={`${monthName}의 일일 비용 추이 그래프`}
            icon={<LuCircleDollarSign size={16} color="#DEDEDE" />}
            colSpan="flex flex-col lg:col-span-3"
            isLoading={isLoading}
          >
            <DailyAllProjectCostChart data={allProjectsMonthPeriodData?.dailyProjectCosts ?? []} />
          </ChartContainer>
        </div>

        <div className="gap-4 grid grid-cols-1 lg:grid-cols-4">
          {/* 프로젝트 별 전체 API 요청 수 추이 그래프 */}
          <ChartContainer
            title={`${monthName}의 프로젝트별 API 요청 수 비교`}
            icon={<LuGlobe size={16} color="#DEDEDE" />}
            colSpan="flex flex-col lg:col-span-1"
            isLoading={isLoading}
          >
            <MonthProjectAPIChart data={allProjectsMonthPeriodData?.projectRequestCounts ?? []} />
          </ChartContainer>

          {/* 비용 일일 그래프 */}
          <ChartContainer
            title={`${monthName}의 일일 API 요청 수 추이 그래프`}
            icon={<LuFileChartColumnIncreasing size={16} color="#DEDEDE" />}
            colSpan="flex flex-col lg:col-span-3"
            isLoading={isLoading}
          >
            <DailyAllProjectAPIChart data={allProjectsMonthPeriodData?.dailyProjectRequests ?? []} />
          </ChartContainer>
        </div>

        <div className="gap-4 grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
            {allProjectsMonthPeriodData?.projectCosts && allProjectsMonthPeriodData.projectCosts.length > 0 &&
              allProjectsMonthPeriodData.projectCosts.map((projectCost, index) => {
                const projectRequest = allProjectsMonthPeriodData.projectRequestCounts?.find(
                  (item: { projectId: number }) => item.projectId === projectCost.projectId
                );

                const projectSecond = allProjectsMonthPeriodData.projectSeconds?.find(
                  (item: { projectId: number }) => item.projectId === projectCost.projectId
                );

                const projectName = projectNames[projectCost.projectId];

                return (
                  <ProjectCostCard
                    key={projectCost.projectId}
                    projectId={projectCost.projectId}
                    projectName={projectName || ''}
                    cost={projectCost.cost}
                    requestCount={projectRequest?.requestCount || 0}
                    seconds={projectSecond?.second || 0}
                    index={index}
                  />
                );
              })
            }
          </div>

          {/* 비용 일일 그래프 */}
          <ChartContainer
            title={`${monthName}의 일일 사용 시간 추이 그래프`}
            icon={<LuFileChartColumnIncreasing size={16} color="#DEDEDE" />}
            colSpan="lg:col-span-3 flex flex-col"
            isLoading={isLoading}
          >
            <DailyAllProjectSecondChart data={allProjectsMonthPeriodData?.dailyProjectSeconds ?? []} />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};