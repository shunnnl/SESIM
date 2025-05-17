import { ProjectCost } from "../../types/APIUsageTypes";
import { getProjectNameById, getModelNameById } from '../../utils/projectModelUtils';


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


export const CustomTooltip = ({ active, payload, nameMap, prefix = "$", isProject = true }: ChartTooltipProps) => {
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
            <span>{prefix} {item.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};


export const CustomBarLineTooltip = ({ active, payload, label, nameMap, prefix = "$" }: ChartTooltipProps) => {
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
              <span>{prefix} {entry.value.toLocaleString()}</span>
            </p>
          );
        })}
        {payload.length > 1 && (
          <>
            <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
            <p className="text-gray-800 flex justify-between gap-4 font-medium">
              <span>총계:</span>
              <span>{prefix} {total.toLocaleString()}</span>
            </p>
          </>
        )}
      </div>
    );
  }

  return null;
};


export const CustomSingleTooltip = ({ active, payload, label, prefix = "$" }: ChartTooltipProps) => {
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
            <span className="font-medium text-gray-800">{prefix} {entry.value.toLocaleString()}</span>
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
            <p className="text-sm font-medium text-gray-400">{name || `ID: ${id}`}</p>
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
            <p className="text-sm font-medium text-gray-400">{name || `ID: ${id}`}</p>
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