import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { ProjectCost } from "../../../store/APIUsageSlice";

const gradientColors = ["#4F46E5", "#3A7880", "#EC4899", "#033486", "#F59E0B", "#10B981"];

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  projectNames: Record<number, string>;
};

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
};

const CustomLabel = (props: PieLabelProps) => {
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


const CustomTooltip = ({ active, payload, projectNames }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const projectId = parseInt(payload[0].name);
    const projectName = projectNames[projectId];
    
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800">{projectName}</p>
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        {payload.map((item, index) => (
          <p key={index} className="text-gray-800 flex justify-between gap-4">
            <span>₩{item.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const CustomLegend = (props: { payload?: Array<{ value: number, payload: ProjectCost }>, projectNames: Record<number, string> }) => {
  const { payload, projectNames } = props;
  
  if (!payload || payload.length === 0) return null;

  return (
    <ul className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {payload.map((entry, index) => {
        const projectId = entry.payload.projectId;
        const projectName = projectNames[projectId];
        
        return (
          <li 
            key={projectId} 
            className="flex flex-row gap-2 items-center"
            style={{ width: "calc(50% - 16px)" }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: gradientColors[index % gradientColors.length] }}
            />
            <p className="text-sm font-medium text-gray-400">{projectName}</p>
          </li>
        );
      })}
    </ul>
  );
};


export default function AllCostDonutChartPerProjects({ data }: { data: ProjectCost[] }) {
  const projectInfo = useSelector((state: RootState) => state.apiUsage.projectInfo);
  const storeProjectNames: Record<number, string> = {};
  
  if (projectInfo) {
    projectInfo.forEach(project => {
      storeProjectNames[project.projectId] = project.name;
    });
  }

  const projectNames = storeProjectNames;

  return (
    <div className="w-full h-[300px] px-4 pb-4 backdrop-blur-md shadow-inner z-10">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart
          data={data}
          margin={{ top: 0, right: 4, left: 4, bottom: 4 }}
        >
          <Tooltip
            content={<CustomTooltip projectNames={projectNames} />}
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }} />
          <Legend content={
            <CustomLegend 
              projectNames={projectNames}
              payload={data.map(item => ({ value: item.cost, payload: item }))} 
            />
          }/>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            innerRadius={50}
            outerRadius={80}
            dataKey="cost"
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.projectId}`}
                fill={`${gradientColors[index % gradientColors.length]}50`}
                name={entry.projectId.toString()}
                stroke={`${gradientColors[index % gradientColors.length]}`}
                strokeWidth={1.5}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};