import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ProjectCost } from "../../../types/APIUsageTypes";
import { useProjectNames } from '../../../utils/projectModelUtils';
import { 
  CustomTooltip, 
  CustomLabel, 
  CustomProjectLegend, 
  graphColors 
} from '../../common/ChartComponents';

export default function AllCostDonutChartPerProjects({ data }: { data: ProjectCost[] }) {
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
            content={<CustomTooltip nameMap={projectNames} />}
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }} />
          <Legend content={
            <CustomProjectLegend 
              nameMap={projectNames}
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