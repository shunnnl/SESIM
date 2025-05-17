import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from "recharts";
import { MonthProjectCost } from "../../../types/APIUsageTypes";
import { useProjectNames } from "../../../utils/projectModelUtils";
import { CustomBarLineTooltip, CustomBarLegend, graphColors } from "../../common/ChartComponents";

const transformData = (data: MonthProjectCost[] | null) => {
  if (!data || data.length === 0) return [];
  
  const sortedData = [...data].sort((a, b) => {
    return a.month.localeCompare(b.month);
  });
  
  const recentMonths = sortedData.slice(-3);  
  const projectIds = new Set<number>();

  recentMonths.forEach(month => {
    month.projectCosts.forEach(project => {
      projectIds.add(project.projectId);
    });
  });
  
  return recentMonths.map(month => {
    const result: Record<string, number | string> = { month: month.month };
    
    month.projectCosts.forEach(project => {
      result[project.projectId.toString()] = Math.round(project.cost * 100) / 100;
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
  
  const totalCosts = data.map(monthData => {
    let total = 0;
    Object.keys(monthData).forEach(key => {
      if (key !== "month" && typeof monthData[key] === "number") {
        total += monthData[key] as number;
      }
    });

    return total;
  });
  
  return Math.max(...totalCosts);
};

export default function MonthlyTotalCostChart({ data }: { data: MonthProjectCost[] | null }) {
  const projectNames = useProjectNames();
  
  const chartData = useMemo(() => transformData(data), [data]);
  
  const projectKeys = useMemo(() => {
    if (chartData.length === 0) {
      return [];
    }

    return Object.keys(chartData[0]).filter(key => key !== "month");
  }, [chartData]);
  
  const maxValue = useMemo(() => getMaxValue(chartData), [chartData]);

  const legendPayload = useMemo(() => {
    return projectKeys.map((key, index) => ({
      value: projectNames[parseInt(key)] || `프로젝트 ${key}`,
      color: graphColors[index % graphColors.length]
    }));
  }, [projectKeys, projectNames]);
  
  if (!data || chartData.length === 0 || projectKeys.length === 0) {
    return (
      <div className="w-full h-80 p-4 flex justify-center items-center">
        <p className="text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

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
            tickFormatter={(v: number) => `₩${v.toLocaleString()}`}
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              fill: "#9CA3AF"
            }}
            domain={[0, Math.ceil(maxValue * 1.2)]}
          />
          <Tooltip 
            content={<CustomBarLineTooltip nameMap={projectNames} prefix="₩" />} 
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }}
          />
          <Legend content={<CustomBarLegend payload={legendPayload} />} />
          
          {projectKeys.map((key, index) => {
            const color = graphColors[index % graphColors.length];
            return (
              <Bar
                key={key}
                dataKey={key}
                name={projectNames[parseInt(key)] || `프로젝트 ${key}`}
                stackId="stack"
                barSize={30}
                fill={`${color}80`}
                stroke={color}
                radius={index === projectKeys.length - 1 ? [10, 10, 0, 0] : [0, 0, 0, 0]}
              >
                {index === projectKeys.length - 1 && (
                  <LabelList
                    position="top"
                    offset={10}
                    formatter={(value: number) => `₩${value.toLocaleString()}`}
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