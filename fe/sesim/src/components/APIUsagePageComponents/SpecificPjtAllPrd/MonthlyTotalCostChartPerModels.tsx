import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from "recharts";
import { RootState } from "../../../store";
import { MonthModelCost } from "../../../types/APIUsageTypes";
import { graphColors, CustomBarLineTooltip, CustomBarLegend } from "../../../components/common/ChartComponents";

interface ChartDataItem {
  month: string;
  [modelId: string]: number | string;
};

const transformData = (data: MonthModelCost[] | null): ChartDataItem[] => {
  if (!data || data.length === 0) return [];
  
  const sortedData = [...data].sort((a, b) => {
    return a.month.localeCompare(b.month);
  });
  
  const recentMonths = sortedData.slice(-3);  
  const modelIds = new Set<number>();

  recentMonths.forEach(month => {
    month.modelCosts.forEach(model => {
      modelIds.add(model.modelId);
    });
  });
  
  return recentMonths.map(month => {
    const result: ChartDataItem = { month: month.month };
    
    month.modelCosts.forEach(model => {
      result[model.modelId.toString()] = model.cost;
    });
    
    modelIds.forEach(id => {
      if (!(id.toString() in result)) {
        result[id.toString()] = 0;
      }
    });
    
    return result;
  });
};


const getMaxValue = (data: ChartDataItem[] | null): number => {
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


export default function MonthlyTotalCostChartPerModels({ data }: { data: MonthModelCost[] | null }) {
  const modelInfo = useSelector((state: RootState) => state.apiUsage.apiUsageInitData?.models);
  
  const modelNames = useMemo(() => {
    const names: Record<string, string> = {};
    if (modelInfo) {
      modelInfo.forEach(model => {
        names[model.modelId.toString()] = model.name;
      });
    }

    return names;
  }, [modelInfo]);
  
  const chartData = useMemo(() => transformData(data), [data]);
  
  const modelKeys = useMemo(() => {
    if (chartData.length === 0) {
      return [];
    }

    return Object.keys(chartData[0]).filter(key => key !== "month");
  }, [chartData]);
  
  const maxValue = useMemo(() => getMaxValue(chartData), [chartData]);
  
  if (!data || chartData.length === 0 || modelKeys.length === 0) {
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
            tickFormatter={(v: number) => `$${v.toLocaleString()}`}
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              fill: "#9CA3AF"
            }}
            domain={[0, Math.ceil(maxValue * 1.2)]}
          />
          <Tooltip 
            content={<CustomBarLineTooltip nameMap={modelNames} prefix="$" />} 
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }}
          />
          <Legend 
            content={
              <CustomBarLegend 
                payload={
                  modelKeys.map((key, index) => ({
                    value: modelNames[key] || key,
                    color: graphColors[index % graphColors.length]
                  }))
                }
              />
            }
          />
          
          {modelKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              name={modelNames[key]}
              stackId="stack"
              barSize={30}
              fill={`${graphColors[index % graphColors.length]}80`}
              stroke={graphColors[index % graphColors.length]}
              radius={index === modelKeys.length - 1 ? [10, 10, 0, 0] : [0, 0, 0, 0]}
            >
              {index === modelKeys.length - 1 && (
                <LabelList
                  position="top"
                  offset={10}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  style={{ 
                    fill: "#EEEEEE", 
                    fontSize: 12, 
                    fontWeight: 500 
                  }}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};