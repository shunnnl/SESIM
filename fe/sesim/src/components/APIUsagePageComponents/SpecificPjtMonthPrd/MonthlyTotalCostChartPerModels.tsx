import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ModelCost } from "../../../types/APIUsageTypes";
import { useModelNames } from '../../../utils/projectModelUtils';
import { 
  CustomTooltip, 
  CustomLabel, 
  CustomModelLegend, 
  graphColors 
} from '../../common/ChartComponents';

export default function MonthlyTotalCostChartPerModels({ data }: { data: ModelCost[] }) {
  const modelNames = useModelNames();

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
            content={<CustomTooltip nameMap={modelNames} prefix="$" />}
            cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }} />
          <Legend content={
            <CustomModelLegend 
              nameMap={modelNames}
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
                key={`${entry.modelId}`}
                fill={`${graphColors[index % graphColors.length]}50`}
                name={entry.modelId.toString()}
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