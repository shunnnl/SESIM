import { AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area } from 'recharts';
import { CostPerDay } from "../../../store/APIUsageSlice";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-1 py-2 order rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800 px-2">{label}</p>
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        <p className="text-gray-800 px-2 text-right">$ {payload[0].value.toLocaleString()}</p>
      </div>
    );
  }

  return null;
};


const CustomLegend = () => {
  return (
    <ul className="flex flex-row gap-2 justify-center items-center">
      <li className="flex flex-row gap-2 items-center">
        <div className="w-2 h-2 bg-[#033486] rounded-full"></div> 
        <p className="text-sm font-medium text-gray-400">비용</p>
      </li>
    </ul>
  );
};


const getMaxValue = (data: CostPerDay[] | null) => {
  if (!data) return 0;
  return Math.max(...data.map(item => item.cost));
};


export default function DailyCostChart({ data }: { data: CostPerDay[] | null }) {
  return (
    <div className="w-full h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data ?? []}
          margin={{ top: 20, right: 4, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#033486" stopOpacity={1} />
              <stop offset="100%" stopColor="#033486" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#04101D"
          />
          <XAxis 
            dataKey="day"
            axisLine={{ stroke: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            style={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }}
          />
          <YAxis 
            axisLine={{ stroke: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            tickFormatter={(v) => `$${v.toLocaleString()}`}
            style={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }}
            domain={[0, Math.trunc(getMaxValue(data) * 1.2 * 100) / 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(4, 16, 29, 0.3)'}}/>
          <Legend content={<CustomLegend />} />
          <Area
            type="monotone"
            dataKey="cost"
            name="비용"
            fill="url(#gradient-blue)"
            stroke="rgba(3, 52, 134, 0.7)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
