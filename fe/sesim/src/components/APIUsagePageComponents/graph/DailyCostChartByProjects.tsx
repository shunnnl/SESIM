import { AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area } from "recharts";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { DailyProjectCost, ProjectCost } from "../../../store/APIUsageSlice";

// 수정된 TooltipContentProps 인터페이스
interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
}

interface MonthlyDataItem {
  month: string;
  [projectKey: string]: string | number;
}

const barColors = ["#4F46E5", "#3A7880", "#EC4899", "#033486", "#F59E0B", "#10B981"];

// 월별 비용 데이터로 변환하는 함수
const processMonthlyData = (data: DailyProjectCost[] | null) => {
  if (!data || data.length === 0) return [];
  
  const monthlyData: Record<string, MonthlyDataItem> = {};
  
  // 모든 일별 데이터를 월별로 집계
  data.forEach(dailyData => {
    // 일별 데이터가 유효한지 확인
    if (!dailyData || !dailyData.date) return;
    
    try {
      // 날짜에서 연월 추출 (YYYY-MM 형식)
      const date = new Date(dailyData.date);
      if (isNaN(date.getTime())) return; // 유효하지 않은 날짜는 건너뜀
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey };
      }
      
      // 각 프로젝트별 비용을 월별로 합산
      if (dailyData.projectCosts && Array.isArray(dailyData.projectCosts)) {
        dailyData.projectCosts.forEach((projectCost: ProjectCost) => {
          const projectId = `project_${projectCost.projectId}`;
          
          // 월별 비용 합산
          if (monthlyData[monthKey][projectId]) {
            monthlyData[monthKey][projectId] = (monthlyData[monthKey][projectId] as number) + projectCost.cost;
          } else {
            monthlyData[monthKey][projectId] = projectCost.cost;
          }
        });
      }
    } catch (error) {
      console.error("날짜 처리 중 오류 발생:", dailyData.date, error);
    }
  });
  
  // 데이터가 없는 경우 빈 배열 반환
  if (Object.keys(monthlyData).length === 0) return [];
  
  // 날짜순으로 정렬
  const sortedData = Object.values(monthlyData).sort((a, b) => 
    a.month.localeCompare(b.month)
  );
  
  // 최근 3개월 데이터만 추출 (데이터가 3개월 미만이면 전체 반환)
  return sortedData.slice(-3);
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800 px-1 mb-1">{label}</p>
        <div className="h-[1px] w-full bg-gray-600 mb-2"></div>
        {payload.map((entry, index) => (
          <p key={index} className="flex justify-between items-center gap-4 px-1 py-[2px]">
            <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
            <span className="font-medium text-gray-800">₩ {entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 커스텀 범례 컴포넌트
const CustomLegend = ({ projects }: { projects: Array<{ projectId: number, name: string }> }) => {
  return (
    <ul className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {projects.map((project, index) => (
        <li 
          key={project.projectId} 
          className="flex flex-row gap-2 items-center"
          style={{ width: "calc(50% - 16px)" }}
        >
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: barColors[index % barColors.length] }}
          />
          <p className="text-sm font-medium text-gray-400">{project.name}</p>
        </li>
      ))}
    </ul>
  );
};

// 최대 비용값 계산 함수 (월별 데이터용)
const getMaxMonthlyValue = (data: MonthlyDataItem[] | null | undefined) => {
  if (!data || data.length === 0) return 0;
  
  let maxCost = 0;
  
  data.forEach(monthData => {
    let monthTotal = 0;
    Object.keys(monthData).forEach(key => {
      if (key !== 'month' && typeof monthData[key] === 'number') {
        monthTotal += monthData[key] as number;
      }
    });
    
    if (monthTotal > maxCost) {
      maxCost = monthTotal;
    }
  });
  
  return maxCost;
};

// 데이터에서 고유 프로젝트 ID 추출
const extractUniqueProjects = (data: DailyProjectCost[] | null) => {
  if (!data || data.length === 0) return [];
  
  const projectsMap = new Map<number, boolean>();
  
  data.forEach(dailyData => {
    if (dailyData.projectCosts && Array.isArray(dailyData.projectCosts)) {
      dailyData.projectCosts.forEach(projectCost => {
        projectsMap.set(projectCost.projectId, true);
      });
    }
  });
  
  return Array.from(projectsMap.keys());
};

export default function DailyCostChartByProjects({ data }: { data: DailyProjectCost[] | null }) {
  const projectInfo = useSelector((state: RootState) => state.apiUsage.projectInfo);
  
  const projectNames = useMemo(() => {
    const names: Record<number, string> = {};
    if (projectInfo) {
      projectInfo.forEach(project => {
        names[project.projectId] = project.name;
      });
    }
    return names;
  }, [projectInfo]);
  
  const monthlyData = useMemo(() => processMonthlyData(data), [data]);
  const maxMonthValue = useMemo(() => getMaxMonthlyValue(monthlyData), [monthlyData]);
  const uniqueProjectIds = useMemo(() => extractUniqueProjects(data), [data]);
  
  // 프로젝트 정보 배열 생성
  const projectsInfo = useMemo(() => {
    return uniqueProjectIds.map(id => ({
      projectId: id,
      name: projectNames[id] || `프로젝트 ${id}`
    }));
  }, [uniqueProjectIds, projectNames]);
  
  if (!data || data.length === 0 || monthlyData.length === 0) {
    return (
      <div className="w-full h-80 p-4 flex justify-center items-center">
        <p className="text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyData}
          margin={{ top: 20, right: 4, left: 4, bottom: 4 }}
        >
          <defs>
            {uniqueProjectIds.map((projectId, index) => {
              const color = barColors[index % barColors.length];
              return (
                <linearGradient
                  key={`gradient-${projectId}`}
                  id={`gradient-project-${projectId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#04101D"
          />
          <XAxis
            dataKey="month"
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}s
            style={{ fontSize: 12, fontWeight: 600, fill: "#9CA3AF" }}
          />
          <YAxis
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}
            tickFormatter={(v) => `₩${v.toLocaleString()}`}
            style={{ fontSize: 12, fontWeight: 600, fill: "#9CA3AF" }}
            domain={[0, Math.ceil(maxMonthValue * 1.2)]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }}
          />
          <Legend content={<CustomLegend projects={projectsInfo} />} />
          
          {/* 각 프로젝트별로 Area 컴포넌트 추가 */}
          {uniqueProjectIds.map((projectId, index) => {
            const key = `project_${projectId}`;
            const color = barColors[index % barColors.length];
            const name = projectNames[projectId] || `프로젝트 ${projectId}`;
            
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                fillOpacity={0.5}
                fill={`url(#gradient-project-${projectId})`}
                strokeWidth={2}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}; 