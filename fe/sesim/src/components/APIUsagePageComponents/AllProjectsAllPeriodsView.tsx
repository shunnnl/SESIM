import { useSelector } from "react-redux";
import { MdDonutSmall } from "react-icons/md";
import { LuActivity, LuWallet, LuClock, LuCloudCog, LuGlobe, LuCircleDollarSign, LuFileChartColumnIncreasing } from "react-icons/lu";
import { RootState } from "../../store";
import { StatCard, ChartContainer } from "./APIUsageChartComponents";
import MonthlyTotalAPIChart from "./AllPjtAllPrd/MonthlyTotalAPIChart";
import MonthlyTotalCostChart from "./AllPjtAllPrd/MonthlyTotalCostChart";
import DailyProjectCostChart from "./AllPjtAllPrd/DailyProjectCostChart";
import DailyAllProjectCostChart from "./AllPjtAllPrd/DailyAllProjectCostChart";
import AllCostDonutChartPerProjects from "./AllPjtAllPrd/AllCostDonutChartPerProjects";

export const AllProjectsAllPeriodsView: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.apiUsage.isAllProjectsAllPeriodsLoading);
  const allProjectsAllPeriodsData = useSelector((state: RootState) => state.apiUsage.allProjectsAllPeriodsData);

  const statCards = [
    {
      title: "총 비용",
      value: `$ ${allProjectsAllPeriodsData?.totalCost ?? 0}`,
      icon: <LuWallet size={18} color="#242B3A" />,
      bgColor: "#5F9FED",
      delay: 0,
      isLoading: isLoading
    },
    {
      title: "총 API 요청 수",
      value: allProjectsAllPeriodsData?.totalRequests ?? 0,
      suffix: "건",
      icon: <LuActivity size={18} color="#242B3A" />,
      bgColor: "#88D6BE",
      delay: 0.1,
      isLoading: isLoading
    },
    {
      title: "총 사용 시간",
      value: allProjectsAllPeriodsData?.totalSeconds ?? 0,
      suffix: "h",
      icon: <LuClock size={18} color="#242B3A" />,
      bgColor: "#837CF7",
      delay: 0.2,
      isLoading: isLoading
    },
    {
      title: "총 프로젝트 수",
      value: allProjectsAllPeriodsData?.totalProjectCount ?? 0,
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

        <div className="gap-4 grid grid-cols-1 md:grid-cols-8">
          {/* 프로젝트 별 총 비용 추이 그래프 */}
          <ChartContainer
            title="프로젝트 별 총 비용 추이"
            icon={<MdDonutSmall size={16} color="#DEDEDE" />}
            colSpan="col-span-1 md:col-span-2"
            isLoading={isLoading}
          >
            <AllCostDonutChartPerProjects data={allProjectsAllPeriodsData?.projectCosts ?? []} />
          </ChartContainer>

          {/* 최근 3개월 전체 비용 추이 그래프 */}
          <ChartContainer
            title="월 별 비용 추이 (최근 3개월)"
            icon={<LuCircleDollarSign size={16} color="#DEDEDE" />}
            colSpan="col-span-1 md:col-span-3"
            delay={0.4}
            isLoading={isLoading}
          >
            <MonthlyTotalCostChart data={allProjectsAllPeriodsData?.monthProjectCosts ?? []} />
          </ChartContainer>

          {/* 최근 3개월 전체 API 요청 수 추이 그래프 */}
          <ChartContainer
            title="월 별 API 요청 수 추이 (최근 3개월)"
            icon={<LuGlobe size={16} color="#DEDEDE" />}
            colSpan="col-span-1 md:col-span-3"
            delay={0.5}
            isLoading={isLoading}
          >
            <MonthlyTotalAPIChart data={allProjectsAllPeriodsData?.monthProjectRequests ?? []} />
          </ChartContainer>
        </div>

        {/* 최근 3개월 동안 비용 일일 그래프 */}
        <ChartContainer
          title="일일 비용 추이 그래프 (최근 3개월)"
          icon={<LuFileChartColumnIncreasing size={16} color="#DEDEDE" />}
          delay={0.6}
          isLoading={isLoading}
        >
          <DailyAllProjectCostChart data={allProjectsAllPeriodsData?.dailyProjectCosts ?? []} />
        </ChartContainer>

        {/* 프로젝트별 일일 비용 그래프 */}
        <ChartContainer
          title="프로젝트별 일일 비용 추이 그래프 (최근 3개월)"
          icon={<LuFileChartColumnIncreasing size={16} color="#DEDEDE" />}
          delay={0.7}
          isLoading={isLoading}
        >
          <DailyProjectCostChart data={allProjectsAllPeriodsData?.dailyProjectCosts ?? []} />
        </ChartContainer>
      </div>
    </div>
  );
};