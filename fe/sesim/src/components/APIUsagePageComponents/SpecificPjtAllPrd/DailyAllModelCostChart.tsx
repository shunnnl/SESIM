import { useMemo } from "react";
import { AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area } from "recharts";
import { DailyModelCost } from "../../../types/APIUsageTypes";
import { CustomSingleTooltip, CustomSingleLegend } from "../../common/ChartComponents";

interface DailyDataItem {
  date: string;
  totalCost: number;
};

const processDailyData = (data: DailyModelCost[] | null): DailyDataItem[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const dailyData: Record<string, DailyDataItem> = {};

  data.forEach(dailyItem => {
    if (!dailyItem || !dailyItem.date) return;

    try {
      const date = new Date(dailyItem.date);
      if (isNaN(date.getTime())) return;

      const dateKey = date.toISOString().split("T")[0];
      const displayDate = `${dateKey.substring(5, 10)}`;
      
      dailyData[dateKey] = { date: displayDate, totalCost: dailyItem.totalCost };
    } catch (error) {
      console.error("날짜 처리 중 오류 발생:", dailyItem.date, error);
    }
  });

  if (Object.keys(dailyData).length === 0) {
    return [];
  }

  const sortedData = Object.values(dailyData).sort((a, b) => {
    const dateA = new Date(Object.keys(dailyData).find(key => dailyData[key] === a) || "");
    const dateB = new Date(Object.keys(dailyData).find(key => dailyData[key] === b) || "");
    return dateA.getTime() - dateB.getTime();
  });

  return sortedData.slice(-90);
};


const getMaxDailyValue = (data: DailyDataItem[] | null | undefined) => {
  if (!data || data.length === 0) {
    return 0;
  }

  let projectMaxValues = 0;

  data.forEach(dayData => {
    if (dayData.totalCost > projectMaxValues) {
      projectMaxValues = dayData.totalCost;
    }
  });

  return projectMaxValues;
};


export default function DailyAllModelCostChart({ data, projectName = "" }: { data: DailyModelCost[] | null, projectName?: string }) {
  const dailyData = useMemo(() => processDailyData(data), [data]);
  const maxDailyValue = useMemo(() => getMaxDailyValue(dailyData), [dailyData]);

  const lineColor = "#EC4899";

  if (!data || data.length === 0 || dailyData.length === 0) {
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
        <AreaChart
          data={dailyData}
          margin={{ top: 20, right: 4, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient
              id="costGradient" 
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop 
                offset="5%" 
                stopColor={lineColor} 
                stopOpacity={0.8}
              />
              <stop 
                offset="95%"
                stopColor={lineColor}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#04101D"
          />
          <XAxis
            dataKey="date"
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}
            tick={{ style: { fontSize: 12, fontWeight: 600, fill: "#9CA3AF" } }}
          />
          <YAxis
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}
            tickFormatter={(v: number) => `₩${v.toLocaleString()}`}
            tick={{ style: { fontSize: 12, fontWeight: 600, fill: "#9CA3AF" } }}
            domain={[0, Math.ceil(maxDailyValue * 1.1 * 100) / 100]}
          />
          <Tooltip
            content={<CustomSingleTooltip nameMap={{}} />}
            cursor={{ stroke: 'rgba(4, 16, 29, 0.3)', strokeWidth: 1 }}
          />
          <Legend content={
            <CustomSingleLegend 
              label={`${projectName} 비용`} 
              color={lineColor} 
            />
          }/>
          <Area
            type="monotone"
            dataKey="totalCost"
            stroke={lineColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#costGradient)"
            dot={{ r: 1, stroke: lineColor, strokeWidth: 2, fill: "#04101D" }}
            activeDot={{ r: 3, stroke: lineColor, strokeWidth: 2, fill: "#ffffff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};