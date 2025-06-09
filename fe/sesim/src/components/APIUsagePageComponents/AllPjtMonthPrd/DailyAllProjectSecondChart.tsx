import { useMemo } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, Bar, ComposedChart } from "recharts";
import { useProjectNames } from "../../../utils/projectModelUtils";
import { graphColors, CustomBarLineTooltip } from "../../common/ChartComponents";
import { DailyProjectSecond, ProjectSecond } from "../../../types/APIUsageTypes";

interface DailyDataItem {
  date: string;
  [projectKey: string]: string | number;
};

const barColors = "#F9748F";

const processDailyData = (data: DailyProjectSecond[] | null) => {
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
        dailyData[dateKey] = {
          date: displayDate,
          totalSeconds: dailyItem.totalSeconds || 0
        };
      }

      if (dailyItem.projectSeconds && Array.isArray(dailyItem.projectSeconds)) {
        dailyItem.projectSeconds.forEach((projectSecond: ProjectSecond) => {
          dailyData[dateKey][projectSecond.projectId] = projectSecond.second;
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

  return sortedData;
};


const CustomLegend = ({ projects }: { projects: Array<{ projectId: number, name: string }> }) => {
  return (
    <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      <div className="flex flex-row gap-2 items-center">
        <div
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: barColors }}
        />
        <p className="text-sm font-semibold text-gray-400">총 사용 시간</p>
      </div>
      {projects.map((project, index) => (
        <div
          key={project.projectId}
          className="flex flex-row gap-2 items-center"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: graphColors[index % graphColors.length] }}
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


const extractUniqueProjects = (data: DailyProjectSecond[] | null) => {
  if (!data || data.length === 0) {
    return [];
  }

  const projectsMap = new Map<number, boolean>();

  data.forEach(dailyData => {
    if (dailyData.projectSeconds && Array.isArray(dailyData.projectSeconds)) {
      dailyData.projectSeconds.forEach(projectSecond => {
        projectsMap.set(projectSecond.projectId, true);
      });
    }
  });

  return Array.from(projectsMap.keys());
};


export default function DailyAllProjectSecondChart({ data }: { data: DailyProjectSecond[] | null }) {
  const projectNames = useProjectNames();
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
        <ComposedChart
          data={dailyData}
          margin={{ top: 20, right: 4, left: 4, bottom: 4 }}
        >
          <defs>
            {graphColors.map((color, index) => (
              <linearGradient
                id={`costGradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="80%"
                  stopColor={color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
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
            tickFormatter={(v: number) => `${v.toLocaleString()}h`}
            tick={{ style: { fontSize: 12, fontWeight: 600, fill: "#9CA3AF" } }}
            domain={[0, Math.ceil(maxDailyValue * 1.1 * 100) / 100]}
          />
          <Tooltip
            content={<CustomBarLineTooltip nameMap={projectNames} prefix="" />}
            cursor={{ stroke: 'rgba(4, 16, 29, 0.3)', strokeWidth: 1 }}
          />
          <Legend content={<CustomLegend projects={projectsInfo} />} />
          <Bar
            dataKey="totalSeconds"
            fill={barColors}
            name="총 사용 시간"
            fillOpacity={0.2}
            barSize={10}
            radius={[4, 4, 0, 0]}
          />
          {uniqueProjectIds.map((projectId, index) => {
            const key = `${projectId}`;
            const color = graphColors[index % graphColors.length];
            const name = projectNames[projectId];
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 1, stroke: color, strokeWidth: 2, fill: "#04101D" }}
                activeDot={{ r: 3, stroke: color, strokeWidth: 2, fill: "#ffffff" }}
                fillOpacity={1}
                fill={`url(#costGradient-${index})`}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};