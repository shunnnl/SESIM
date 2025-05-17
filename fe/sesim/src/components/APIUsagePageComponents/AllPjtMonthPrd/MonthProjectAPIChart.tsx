import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ProjectRequest } from "../../../types/APIUsageTypes";
import { useProjectNames } from "../../../utils/projectModelUtils";
import { graphColors, CustomLabel, CustomTooltip } from "../../common/ChartComponents";

const CustomAPILegend = (props: { payload?: Array<{ value: number, payload: ProjectRequest }>, nameMap: Record<number, string> }) => {
  const { payload, nameMap } = props;
  
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center">
      {payload.map((entry, index) => {
        const projectId = entry.payload.projectId;
        const projectName = nameMap[projectId];
        
        return (
          <li 
            key={projectId} 
            className="flex flex-row gap-2 items-center"
            style={{ width: "calc(50% - 16px)" }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: graphColors[index % graphColors.length] }}
            />
            <p className="text-sm font-medium text-gray-400">{projectName}</p>
          </li>
        );
      })}
    </ul>
  );
};


export default function MonthProjectAPIChart({ data }: { data: ProjectRequest[] }) {
  const projectNames = useProjectNames();
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 p-4 flex justify-center items-center">
        <p className="text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

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
            content={<CustomTooltip nameMap={projectNames} prefix="" isProject={true} />}
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }} 
          />
          <Legend content={
            <CustomAPILegend 
              nameMap={projectNames}
              payload={data.map(item => ({ value: item.requestCount, payload: item }))} 
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
            dataKey="requestCount"
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.projectId}`}
                fill={`${graphColors[index % graphColors.length]}50`}
                name={entry.projectId.toString()}
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