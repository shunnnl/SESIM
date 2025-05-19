import { useSelector } from "react-redux";
import { LuWallet, LuActivity, LuClock, LuCircleDollarSign, LuFileChartColumnIncreasing } from "react-icons/lu";
import { RootState } from "../../store";
import { APIUsageProjectInfo } from "../../types/ProjectTypes";
import DailyModelCostChart from "./SpecificPjtMonthPrd/DailyModelCostChart";
import { ChartContainer, StatCardIndicator } from "./APIUsageChartComponents";
import DailyModelSecondsChart from "./SpecificPjtMonthPrd/DailyModelSecondsChart";
import DailyModelRequestsChart from "./SpecificPjtMonthPrd/DailyModelRequestsChart";
import MonthlyTotalCostChartPerModels from "./SpecificPjtMonthPrd/MonthlyTotalCostChartPerModels";
import MonthlyTotalRequestsChartPerModels from "./SpecificPjtMonthPrd/MonthlyTotalRequestsChartPerModels";
import MonthlyTotalSecondsChartPerModels from "./SpecificPjtMonthPrd/MonthlyTotalSecondsChartPerModels";

export const SpecificProjectMonthPeriodView: React.FC<{ projectId: string, month: string}> = ({ projectId, month }) => {
  const isLoading = useSelector((state: RootState) => state.apiUsage.isSpecificProjectMonthPeriodLoading);
  const specificProjectMonthPeriodData = useSelector((state: RootState) => state.apiUsage.specificProjectMonthPeriodData);

  const projectInfo = useSelector((state: RootState) => state.apiUsage.apiUsageInitData?.projects);
  const projectName = projectInfo?.find((project: APIUsageProjectInfo) => project.projectId.toString() === projectId)?.name;

  const monthName = month.slice(2,4) + "년 " + month.slice(6, 7) + "월 ";

  const statCards = [
    {
      title: `${projectName}의 ${monthName} 총 비용`,
      value: `$ ${specificProjectMonthPeriodData?.curMonthTotalCost ?? 0}`,
      icon: <LuWallet size={18} color="#242B3A" />,
      bgColor: "#5F9FED",
      delay: 0,
      isLoading: isLoading,
      currentCost: specificProjectMonthPeriodData?.curMonthTotalCost ?? 0,
      previousCost: specificProjectMonthPeriodData?.lastMonthTotalCost ?? 0,
    },
    {
      title: `${projectName}의 ${monthName} 총 API 요청 수`,
      value: specificProjectMonthPeriodData?.curMonthTotalRequests ?? 0,
      suffix: "건",
      icon: <LuActivity size={18} color="#242B3A" />,
      bgColor: "#88D6BE",
      delay: 0,
      isLoading: isLoading,
      currentCost: specificProjectMonthPeriodData?.curMonthTotalRequests ?? 0,
      previousCost: specificProjectMonthPeriodData?.lastMonthTotalRequests ?? 0,
    },
    {
      title: `${projectName}의 ${monthName} 총 사용 시간`,
      value: specificProjectMonthPeriodData?.curMonthTotalSeconds ?? 0,
      suffix: "h",
      icon: <LuClock size={18} color="#242B3A" />,
      bgColor: "#837CF7",
      delay: 0,
      isLoading: isLoading,
      currentCost: specificProjectMonthPeriodData?.curMonthTotalSeconds ?? 0,
      previousCost: specificProjectMonthPeriodData?.lastMonthTotalSeconds ?? 0,
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

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <ChartContainer
            icon={<LuCircleDollarSign size={16} color="#DEDEDE" />}
            title={`${projectName}의 ${monthName} 모델별 비용 비교`}
            colSpan="flex flex-col lg:col-span-1"
            delay={0.4}
          >
            <MonthlyTotalCostChartPerModels data={specificProjectMonthPeriodData?.modelCosts ?? []} />
          </ChartContainer>
          <ChartContainer
            icon={<LuFileChartColumnIncreasing size={16} color="#DEDEDE" />}
            title={`${projectName}의 ${monthName} 일일 비용 추이 그래프`}
            colSpan="flex flex-col lg:col-span-3"
            delay={0.5}
          >
            <DailyModelCostChart data={specificProjectMonthPeriodData?.dailyModelCosts ?? []} />
          </ChartContainer>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <ChartContainer
            icon={<LuCircleDollarSign size={16} color="#DEDEDE" />}
            title={`${projectName}의 ${monthName} 모델별 API 요청 수 비교`}
            colSpan="flex flex-col lg:col-span-1"
            delay={0.4}
          >
            <MonthlyTotalRequestsChartPerModels data={specificProjectMonthPeriodData?.modelRequestCounts ?? []} />
          </ChartContainer>
          <ChartContainer
            icon={<LuFileChartColumnIncreasing size={16} color="#DEDEDE" />}
            title={`${projectName}의 ${monthName} 일일 API 요청 수 추이 그래프`}
            colSpan="flex flex-col lg:col-span-3"
            delay={0.5}
          >
            <DailyModelRequestsChart data={specificProjectMonthPeriodData?.dailyModelRequests ?? []} />
          </ChartContainer>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <ChartContainer
            icon={<LuCircleDollarSign size={16} color="#DEDEDE" />}
            title={`${projectName}의 ${monthName} 모델별 사용 시간 비교`}
            colSpan="flex flex-col lg:col-span-1"
            delay={0.4}
          >
            <MonthlyTotalSecondsChartPerModels data={specificProjectMonthPeriodData?.modelSeconds ?? []} />
          </ChartContainer>
          <ChartContainer
            icon={<LuFileChartColumnIncreasing size={16} color="#DEDEDE" />}
            title={`${projectName}의 ${monthName} 일일 사용 시간 추이 그래프`}
            colSpan="flex flex-col lg:col-span-3"
            delay={0.5}
          >
            <DailyModelSecondsChart data={specificProjectMonthPeriodData?.dailyModelSeconds ?? []} />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};