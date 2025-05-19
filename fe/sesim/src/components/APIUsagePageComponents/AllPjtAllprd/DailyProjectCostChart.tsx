import { useMemo } from "react";
import { LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line } from "recharts";
import { getProjectNameById, useProjectNames } from "../../../utils/projectModelUtils";
import { DailyProjectCost, ProjectCost } from "../../../types/APIUsageTypes";
import { CustomBarLineTooltip, CustomBarLegend, graphColors } from "../../common/ChartComponents";

interface DailyDataItem {
  date: string;
  [projectKey: string]: string | number;
};

const processDailyData = (data: DailyProjectCost[] | null) => {
  if (!data || data.length === 0) {
    return [];
  }

  const dailyData: Record<string, DailyDataItem> = {};

  data.forEach(dailyItem => {
    if (!dailyItem || !dailyItem.date) {
      return;
    }

    try {
      const date = new Date(dailyItem.date);
      if (isNaN(date.getTime())) {
        return;
      }

      const dateKey = date.toISOString().split("T")[0];
      const displayDate = `${dateKey.substring(5, 10)}`;
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: displayDate };
      }

      if (dailyItem.projectCosts && Array.isArray(dailyItem.projectCosts)) {
        dailyItem.projectCosts.forEach((projectCost: ProjectCost) => {
          dailyData[dateKey][projectCost.projectId] = projectCost.cost;
        });
      }
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
    Object.keys(dayData).forEach(key => {
      if (key !== "date" && typeof dayData[key] === "number") {
        const cost = dayData[key] as number;
        
        if (!projectMaxValues || cost > projectMaxValues) {
          projectMaxValues = cost;
        }
      }
    });
  });

  return projectMaxValues;
};


const extractUniqueProjects = (data: DailyProjectCost[] | null) => {
  if (!data || data.length === 0) {
    return [];
  }

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

export default function DailyProjectCostChart({ data }: { data: DailyProjectCost[] | null }) {
  const projectNames = useProjectNames();

  const dailyData = useMemo(() => processDailyData(data), [data]);
  const maxDailyValue = useMemo(() => getMaxDailyValue(dailyData), [dailyData]);
  const uniqueProjectIds = useMemo(() => extractUniqueProjects(data), [data]);

  const legendPayload = useMemo(() => {
    return uniqueProjectIds.map((id, index) => ({
      value: getProjectNameById(id, projectNames),
      color: graphColors[index % graphColors.length]
    }));
  }, [uniqueProjectIds, projectNames]);

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
        <LineChart
          data={dailyData}
          margin={{ top: 20, right: 4, left: 4, bottom: 4 }}
        >
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
            content={<CustomBarLineTooltip nameMap={projectNames} prefix="₩" />}
            cursor={{ stroke: 'rgba(4, 16, 29, 0.3)', strokeWidth: 1 }}
          />
          <Legend content={<CustomBarLegend payload={legendPayload} />} />
          {uniqueProjectIds.map((projectId, index) => {
            const key = `${projectId}`;
            const color = graphColors[index % graphColors.length];
            const name = projectNames[projectId];

            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 1, stroke: color, strokeWidth: 2, fill: "#04101D" }}
                activeDot={{ r: 3, stroke: color, strokeWidth: 2, fill: "#ffffff" }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};