import { useSelector } from "react-redux";
import { LuActivity, LuCircleDollarSign, LuWallet, LuClock, LuCloudCog, LuGlobe, LuFileChartColumnIncreasing } from "react-icons/lu";
import { RootState } from "../../store";
import { APIUsageProjectInfo } from "../../types/ProjectTypes";
import { ChartContainer, StatCard } from "./APIUsageChartComponents";
import DailyAllModelCostChart from "./SpecificPjtAllPrd/DailyAllModelCostChart";
import DailySpecificProjectCostChart from "./SpecificPjtAllPrd/DailySpecificProjectCostChart";
import MonthlyTotalAPIChartPerModels from "./SpecificPjtAllPrd/MonthlyTotalAPIChartPerModels";
import MonthlyTotalCostChartPerModels from "./SpecificPjtAllPrd/MonthlyTotalCostChartPerModels";

export const SpecificProjectAllPeriodsView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const isLoading = useSelector((state: RootState) => state.apiUsage.isSpecificProjectAllPeriodsLoading);
  const specificProjectAllPeriodsData = useSelector((state: RootState) => state.apiUsage.specificProjectAllPeriodsData);
  
  const projectInfo = useSelector((state: RootState) => state.apiUsage.apiUsageInitData?.projects);
  const projectName = projectInfo?.find((project: APIUsageProjectInfo) => project.projectId.toString() === projectId)?.name;

  const statCards = [
    {
      title: `${projectName}의 총 비용`,
      value: `$ ${specificProjectAllPeriodsData?.totalCost ?? 0}`,
      icon: <LuWallet size={18} color="#242B3A" />,
      bgColor: "#5F9FED",
      delay: 0,
      isLoading: isLoading
    },
    {
      title: `${projectName}의 총 API 요청 수`,
      value: specificProjectAllPeriodsData?.totalRequests ?? 0,
      suffix: "건",
      icon: <LuActivity size={18} color="#242B3A" />,
      bgColor: "#88D6BE",
      delay: 0.1,
      isLoading: isLoading
    },
    {
      title: `${projectName}의 총 사용 시간`,
      value: specificProjectAllPeriodsData?.totalSeconds ?? 0,
      suffix: "h",
      icon: <LuClock size={18} color="#242B3A" />,
      bgColor: "#837CF7",
      delay: 0.2,
      isLoading: isLoading
    },
    {
      title: `${projectName}의 총 모델 수`,
      value: specificProjectAllPeriodsData?.totalModelCount ?? 0,
      suffix: "개",
      icon: <LuCloudCog size={18} color="#242B3A" />,
      bgColor: "#EC5A69",
      delay: 0.3,
      isLoading: isLoading
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 통계 정보 */}
      <div className="flex flex-col my-[16px] gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              suffix={card.suffix}
              icon={card.icon}
                bgColor={card.bgColor}
                delay={card.delay}
                isLoading={isLoading}
            />
          ))}
        </div>

        <div className="gap-4 grid grid-cols-2">
          {/* 최근 3개월 전체 비용 추이 그래프 */}
          <ChartContainer
            title={`${projectName}의 비용 추이 (최근 3개월)`}
            icon={<LuCircleDollarSign size={18} color="#DEDEDE" />}
            colSpan="col-span-2 md:col-span-1"
            delay={0.4}
            isLoading={isLoading}
          >
            <MonthlyTotalCostChartPerModels data={specificProjectAllPeriodsData?.monthModelCosts ?? []} />
          </ChartContainer>

          {/* 최근 3개월 전체 API 요청 수 추이 그래프 */}
          <ChartContainer
            title={`${projectName}의 API 요청 수 추이 (최근 3개월)`}
            icon={<LuGlobe size={18} color="#DEDEDE" />}
            colSpan="col-span-2 md:col-span-1"
            delay={0.5}
            isLoading={isLoading}
          >
            <MonthlyTotalAPIChartPerModels data={specificProjectAllPeriodsData?.monthModelRequests ?? []} />
          </ChartContainer>
        </div>

        {/* 최근 3개월 동안 비용 일일 그래프 */}
        <ChartContainer
          title={`${projectName}의 일일 비용 추이 (최근 3개월)`}
          icon={<LuFileChartColumnIncreasing size={18} color="#DEDEDE" />}
          delay={0.6}
          isLoading={isLoading}
        >
          <DailyAllModelCostChart data={specificProjectAllPeriodsData?.dailyModelCosts ?? []} />
        </ChartContainer>

        {/* 최근 3개월 동안 API 요청 일일 그래프 */}
        <ChartContainer
          title={`${projectName}의 모델별 일일 비용 추이 (최근 3개월)`}
          icon={<LuFileChartColumnIncreasing size={18} color="#DEDEDE" />}
          delay={0.7}
          isLoading={isLoading}
        >
          <DailySpecificProjectCostChart data={specificProjectAllPeriodsData?.dailyModelCosts ?? []} />
        </ChartContainer>
      </div>
    </div>
  );
};