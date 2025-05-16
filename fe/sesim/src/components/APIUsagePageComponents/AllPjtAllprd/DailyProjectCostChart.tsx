import { useMemo } from "react";
import { useSelector } from "react-redux";
import { LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line } from "recharts";
import { RootState } from "../../../store";
import { DailyProjectCost, ProjectCost } from "../../../store/APIUsageSlice";

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

interface DailyDataItem {
  date: string;
  [projectKey: string]: string | number;
}

const lineColors = ["#4F46E5", "#3A7880", "#EC4899", "#033486", "#F59E0B", "#10B981"];

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


const CustomLegend = ({ projects }: { projects: Array<{ projectId: number, name: string }> }) => {
  return (
    <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {projects.map((project, index) => (
        <div
          key={project.projectId}
          className="flex flex-row gap-2 items-center"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: lineColors[index % lineColors.length] }}
          />
          <p className="text-sm font-medium text-gray-400">{project.name}</p>
        </div>
      ))}
    </div>
  );
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

  const dailyData = useMemo(() => processDailyData(data), [data]);
  const maxDailyValue = useMemo(() => getMaxDailyValue(dailyData), [dailyData]);
  const uniqueProjectIds = useMemo(() => extractUniqueProjects(data), [data]);

  const projectsInfo = useMemo(() => {
    return uniqueProjectIds.map(id => ({
      projectId: id,
      name: projectNames[id]
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
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(4, 16, 29, 0.3)', strokeWidth: 1 }}
          />
          <Legend content={<CustomLegend projects={projectsInfo} />} />
          {uniqueProjectIds.map((projectId, index) => {
            const key = `${projectId}`;
            const color = lineColors[index % lineColors.length];
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