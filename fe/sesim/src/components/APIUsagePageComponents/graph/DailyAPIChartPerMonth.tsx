import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from 'recharts';

interface ModelCost {
  date: string;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
}

const generateMayDailyData = () => {
  const data: ModelCost[] = [];
  const startDate = new Date(2025, 4, 1);
  const endDate = new Date(2025, 4, 22);

  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    const dailyData: ModelCost = {
      date: `5월 ${currentDate.getDate()}일`,
      1: Math.floor((Math.random() * (1000 - 500) + 500)),
      2: Math.floor((Math.random() * (1000 - 500) + 500)),
      3: Math.floor((Math.random() * (1000 - 500) + 500)),
      4: Math.floor((Math.random() * (1000 - 500) + 500)),
      5: Math.floor((Math.random() * (1000 - 500) + 500)),
      6: Math.floor((Math.random() * (1000 - 500) + 500))
    };

    data.push(dailyData);
  }
  return data;
};

export const data = generateMayDailyData();

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800">{label}</p>
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        {payload.map((item, index) => (
          <p key={index} className="text-gray-800 flex justify-between gap-4">
            <span style={{ color: item.color }}>{item.name}:</span>
            <span>₩{item.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const modelNames = {
  1: "GPT-4",
  2: "GPT-3.5",
  3: "Claude",
  4: "Llama",
  5: "Stable Diffusion",
  6: "DALL-E"
};

const CustomLegend = () => {
  return (
    <ul className="flex flex-wrap gap-4 justify-center items-center">
      {Object.entries(modelNames).map(([key, name]) => (
        <li key={key} className="flex flex-row gap-2 items-center">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `url(#gradient-${key + 1})` }}></div>
          <p className="text-sm font-medium text-gray-400">{name}</p>
        </li>
      ))}
    </ul>
  );
};

export default function DailyCostChartPerMonth() {
  return (
    <div className="w-full h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient id="gradient-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#033486" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#033486" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC4899" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EC4899" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A7880" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3A7880" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradient-6" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#04101D"
          />
          <XAxis
            dataKey="date"
            axisLine={{ stroke: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            style={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }}
          />
          <YAxis
            axisLine={{ stroke: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            tickFormatter={(v) => `$${v.toLocaleString()}`}
            style={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(4, 16, 29, 0.3)' }} />
          <Legend content={<CustomLegend />} />
          {Object.entries(modelNames).map(([key, name]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={name}
              dot={false}
              fill={`url(#gradient-${key})`}
              stroke={`url(#gradient-${key})`}
              strokeWidth={1}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

