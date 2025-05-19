import { LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, PieChart, Pie, Cell } from "recharts";
import { ProjectCost, DailyProjectCost } from "../../types/APIUsageTypes";
import { getProjectNameById, getModelNameById } from "../../utils/projectModelUtils";

export const graphColors = ["#4F46E5", "#3A7880", "#EC4899", "#033486", "#F59E0B", "#10B981"];

export interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
};

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  nameMap: Record<number, string>;
  prefix?: string;
  suffix?: string;
  isProject?: boolean;
  label?: string;
};

export interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
};

export interface LegendItemType {
  value: string;
  color: string;
};

export interface LineChartDataItem {
  date: string;
  [key: string]: string | number;
};

export interface GenericLineChartProps {
  data: LineChartDataItem[];
  keyMap: Record<string, string>;
  tooltipPrefix?: string;
  tooltipSuffix?: string;
  height?: number | string;
  colorMap?: Record<string, string>;
};

export interface ChartDataItem {
  projectId?: number;
  modelId?: number;
  [key: string]: string | number | undefined;
};

export interface GenericPieChartProps {
  data: Array<{ id: number; value: number }>;
  nameMap: Record<number, string>;
  tooltipPrefix?: string;
  height?: number | string;
  isProject?: boolean;
};


export const CustomLabel = (props: PieLabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#EEEEEE"
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="semibold"
      className="select-none"
    >
      {value.toLocaleString()}
    </text>
  );
};


export const CustomTooltip = ({ active, payload, nameMap, prefix = "", suffix = "", isProject = true }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const id = parseInt(payload[0].name);
    const name = isProject ? getProjectNameById(id, nameMap) : getModelNameById(id, nameMap);
    
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800">{name || `ID: ${id}`}</p>
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        {payload.map((item, index) => (
          <p 
            key={index} 
            className="text-gray-800 flex justify-between gap-4"
          >
            <span>{prefix} {item.value.toLocaleString()}{suffix}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};


export const CustomBarLineTooltip = ({ active, payload, label, nameMap, prefix = "", suffix = "" }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    let total = 0;
    
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800">{label}</p>
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        {payload.map((entry, index) => {
          total += entry.value;
          let name = entry.name;
          
          if (entry.dataKey && !isNaN(parseInt(entry.dataKey))) {
            const id = parseInt(entry.dataKey);
            name = getProjectNameById(id, nameMap);
          }
          
          return (
            <p 
              key={index} 
              className="text-gray-800 flex justify-between gap-4"
            >
              <span style={{ color: entry.color }} className="font-medium">{name}:</span>
              <span>{prefix} {entry.value.toLocaleString()}{suffix}</span>
            </p>
          );
        })}

        {payload.length > 1 && (
          <>
            <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
            <p className="text-gray-800 flex justify-between gap-4 font-medium">
              <span>총계:</span>
              <span>{prefix} {total.toLocaleString()}{suffix}</span>
            </p>
          </>
        )}
      </div>
    );
  }

  return null;
};


export const CustomSingleTooltip = ({ active, payload, label, prefix = "", suffix = "" }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800 px-1 mb-1">{label}</p>
        <div className="h-[1px] w-full bg-gray-600 mb-2"></div>
        {payload.map((entry, index) => (
          <p 
            key={index}
            className="flex justify-between items-center gap-4 px-1 py-[2px]"
          >
            <span 
              style={{ color: entry.color }}
              className="font-medium"
            >{entry.name}:</span>
            <span className="font-medium text-gray-800">{prefix} {entry.value.toLocaleString()}{suffix}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};


export const CustomProjectLegend = (props: { 
  payload?: Array<{ value: number, payload: ProjectCost }>, 
  nameMap: Record<number, string> 
}) => {
  const { payload, nameMap } = props;
  
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {payload.map((entry, index) => {
        const id = entry.payload.projectId;
        const name = getProjectNameById(id, nameMap);
        
        return (
          <li 
            key={id} 
            className="flex flex-row gap-2 items-center"
            style={{ width: "calc(50% - 16px)" }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: graphColors[index % graphColors.length] }}
            />
            <p className="text-sm font-medium text-gray-400">{name}</p>
          </li>
        );
      })}
    </ul>
  );
};


export const CustomModelLegend = (props: { 
  payload?: Array<{ value: number, payload: { modelId: number } }>, 
  nameMap: Record<number, string> 
}) => {
  const { payload, nameMap } = props;
  
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {payload.map((entry, index) => {
        const id = entry.payload.modelId;
        const name = getModelNameById(id, nameMap);
        
        return (
          <li 
            key={id} 
            className="flex flex-row gap-2 items-center"
            style={{ width: "calc(50% - 16px)" }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: graphColors[index % graphColors.length] }}
            />
            <p className="text-sm font-medium text-gray-400">{name}</p>
          </li>
        );
      })}
    </ul>
  );
};


export const CustomBarLegend = ({ payload }: { payload?: LegendItemType[] }) => {
  if (!payload || payload.length === 0) return null;
  
  return (
    <ul className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {payload.map((entry, index) => (
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
      ))}
    </ul>
  );
};


export const CustomSingleLegend = ({ label, color = graphColors[0] }: { label: string, color?: string }) => {
  return (
    <div className="flex flex-row flex-wrap justify-center items-center">
      <div className="flex flex-row gap-2 items-center">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <p className="text-sm font-medium text-gray-400">{label}</p>
      </div>
    </div>
  );
};


export const GenericLineChart = ({data, keyMap, tooltipPrefix = "", tooltipSuffix = "", height = "80", colorMap = {}}: GenericLineChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`w-full h-${height} p-4 flex justify-center items-center`}>
        <p className="text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

  const dataKeys = Object.keys(data[0]).filter(key => key !== "date");
  
  const maxValue = data.reduce((max, item) => {
    dataKeys.forEach(key => {
      const value = typeof item[key] === 'number' ? item[key] as number : 0;

      if (value > max) {
        max = value;
      }
    });

    return max;
  }, 0);


  const legendPayload = dataKeys.map((key, index) => ({
    value: keyMap[key] || key,
    color: colorMap[key] || graphColors[index % graphColors.length]
  }));

  return (
    <div className={`w-full h-${height} p-4`}>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={data}
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
            tickFormatter={(v: number) => `${tooltipPrefix} ${v.toLocaleString()}${tooltipSuffix}`}
            tick={{ style: { fontSize: 12, fontWeight: 600, fill: "#9CA3AF" } }}
            domain={[0, Math.ceil(maxValue * 1.1 * 100) / 100]}
          />
          <Tooltip
            content={
            <CustomBarLineTooltip 
              nameMap={keyMap} 
              prefix={tooltipPrefix} 
              suffix={tooltipSuffix} 
            />}
            cursor={{ stroke: 'rgba(4, 16, 29, 0.3)', strokeWidth: 1 }}
          />
          <Legend content={<CustomBarLegend payload={legendPayload} />} />
          {dataKeys.map((key, index) => {
            const color = colorMap[key] || graphColors[index % graphColors.length];
            const name = keyMap[key] || key;

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


export const processDailyData = (data: DailyProjectCost[] | null): LineChartDataItem[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const dailyData: Record<string, LineChartDataItem> = {};

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
          dailyData[dateKey][projectCost.projectId.toString()] = projectCost.cost;
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


export const transformPieChartData = (data: ChartDataItem[] | null, valueKey: string): Array<{ id: number; value: number }> => {
  if (!data || data.length === 0) {
    return [];
  }

  return data.map(item => ({
    id: item.projectId || item.modelId || 0,
    value: item[valueKey] as number
  }));
};


export const GenericPieChart = ({data, nameMap, tooltipPrefix = "₩", height = "300px", isProject = true}: GenericPieChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 p-4 flex justify-center items-center">
        <p className="text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-[${height}] px-4 pb-4 backdrop-blur-md shadow-inner z-10`}>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart
          data={data}
          margin={{ top: 0, right: 4, left: 4, bottom: 4 }}
        >
          <Tooltip
            content={
            <CustomTooltip 
              nameMap={nameMap} 
              prefix={tooltipPrefix} 
              isProject={isProject} 
            />}
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }}
          />
          <Legend content={
            <CustomBarLegend
              payload={data.map((item, index) => ({
                value: nameMap[item.id],
                color: graphColors[index % graphColors.length]
              }))}
            />
          } />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            nameKey="id"
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.id}`}
                fill={`${graphColors[index % graphColors.length]}50`}
                name={entry.id.toString()}
                stroke={`${graphColors[index % graphColors.length]}`}
                strokeWidth={1.5}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}; 