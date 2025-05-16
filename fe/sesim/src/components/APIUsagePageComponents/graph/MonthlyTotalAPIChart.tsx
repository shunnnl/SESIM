import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from "recharts";
import { RootState } from "../../../store";
import { MonthProjectRequest } from '../../../store/APIUsageSlice';

interface ProjectRequest {
  projectId: number;
  requestCount: number;
}

interface ChartDataItem {
  month: string;
  [projectId: string]: number | string;
}

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
  dataKey: string;
  payload: ChartDataItem;
};

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  projectNames: Record<number, string>;
};

interface LegendItemType {
  value: string;
  color: string;
}

const barColors = ["#4F46E5", "#3A7880", "#EC4899", "#033486", "#F59E0B", "#10B981"];

const CustomTooltip = ({ active, payload, projectNames }: TooltipProps) => {
  if (active && payload && payload.length) {
    const month = payload[0].payload.month;
    let totalRequests = 0;
    
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800">{month}</p>
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        {payload.map((entry, index) => {
          totalRequests += entry.value;
          const projectId = parseInt(entry.dataKey);
          const projectName = projectNames[projectId];
          
          return (
            <p key={index} className="text-gray-800 flex justify-between gap-4">
              <span>{projectName}:</span>
              <span>{entry.value.toLocaleString()}회</span>
            </p>
          );
        })}
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        <p className="text-gray-800 flex justify-between gap-4 font-medium">
          <span>총 요청:</span>
          <span>{totalRequests.toLocaleString()}회</span>
        </p>
      </div>
    );
  }
};

const CustomLegend = ({ payload }: { payload?: LegendItemType[] }) => {
  if (!payload || payload.length === 0) return null;
  
  return (
    <ul className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {payload.map((entry, index) => {
        return (
          <li 
            key={`item-${index}`} 
            className="flex flex-row gap-2 items-center"
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm font-medium text-gray-400">{entry.value}</p>
          </li>
        );
      })}
    </ul>
  );
};

const transformData = (data: MonthProjectRequest[] | null) => {
  if (!data || data.length === 0) return [];
  
  const sortedData = [...data].sort((a, b) => {
    return a.month.localeCompare(b.month);
  });
  
  const recentMonths = sortedData.slice(-3);
  
  const projectIds = new Set<number>();
  recentMonths.forEach(month => {
    month.projectRequests.forEach((project: ProjectRequest) => {
      projectIds.add(project.projectId);
    });
  });
  
  return recentMonths.map(month => {
    const result: Record<string, number | string> = { month: month.month };
    
    month.projectRequests.forEach((project: ProjectRequest) => {
      result[project.projectId.toString()] = project.requestCount;
    });
    
    projectIds.forEach(id => {
      if (!(id.toString() in result)) {
        result[id.toString()] = 0;
      }
    });
    
    return result;
  });
};

const getMaxValue = (data: Record<string, number | string>[] | null) => {
  if (!data || data.length === 0) return 0;
  
  const totalRequests = data.map(monthData => {
    let total = 0;
    Object.keys(monthData).forEach(key => {
      if (key !== "month" && typeof monthData[key] === "number") {
        total += monthData[key] as number;
      }
    });
    return total;
  });
  
  return Math.max(...totalRequests);
};

export default function MonthlyTotalAPIChart({ data }: { data: MonthProjectRequest[] | null }) {
  const projectInfo = useSelector((state: RootState) => state.apiUsage.projectInfo);
  
  const projectNames = useMemo(() => {
    const names: Record<string, string> = {}; 
    if (projectInfo) {
      projectInfo.forEach(project => {
        names[project.projectId.toString()] = project.name;
      });
    }
    return names;
  }, [projectInfo]);
  
  const chartData = useMemo(() => {
    const transformedData = transformData(data);
    return transformedData;
  }, [data]);
  
  const projectKeys = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const keys = Object.keys(chartData[0]).filter(key => key !== "month");
    console.log('Project keys:', keys);
    return keys;
  }, [chartData]);
  
  const maxValue = useMemo(() => getMaxValue(chartData), [chartData]);
  
  return (
    <div className="w-full h-80 p-4">
      <ResponsiveContainer 
        width="100%" 
        height="100%"
      >
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 4, left: 4, bottom: 4 }}
          stackOffset="sign"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#04101D"
          />
          <XAxis
            dataKey="month"
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}
            style={{ fontSize: 12, fontWeight: 600, fill: "#9CA3AF" }}
          />
          <YAxis
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}
            tickFormatter={(v) => `${v.toLocaleString()}`}
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              fill: "#9CA3AF"
            }}
            domain={[0, Math.ceil(maxValue * 1.2)]}
          />
          <Tooltip 
            content={<CustomTooltip projectNames={projectNames} />} 
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }}
          />
          <Legend 
            content={
              <CustomLegend 
                payload={
                  projectKeys.map((key, index) => ({
                    value: key,
                    color: barColors[index % barColors.length]
                  }))
                }
              />
            }
          />
          
          {projectKeys.map((key, index) => {
            console.log(`Rendering bar for project key: ${key}`);
            return (
              <Bar
                key={key}
                dataKey={key}
                name={projectNames[key] || `프로젝트 ${key}`}
                stackId="stack"
                barSize={30}
                fill={`${barColors[index % barColors.length]}80`}
                stroke={barColors[index % barColors.length]}
                radius={index === projectKeys.length - 1 ? [10, 10, 0, 0] : [0, 0, 0, 0]}
              >
                {index === projectKeys.length - 1 && (
                  <LabelList
                    position="top"
                    offset={10}
                    formatter={(value: number) => `${value.toLocaleString()}`}
                    style={{ 
                      fill: '#EEEEEE', 
                      fontSize: 12, 
                      fontWeight: 500 
                    }}
                  />
                )}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};