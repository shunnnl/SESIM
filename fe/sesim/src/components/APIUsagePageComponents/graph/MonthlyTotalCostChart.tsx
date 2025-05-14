import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from 'recharts';

const data = [
  { month: '25년 03월', totalCost: 320000 },
  { month: '25년 04월', totalCost: 420000 },
  { month: '25년 05월', totalCost: 550000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-100/50 backdrop-blur-sm px-1 py-2 order rounded shadow-sm text-sm">
        <p className="font-semibold text-gray-800 px-2">{label}</p>
        <div className="h-[1px] w-full bg-gray-600 my-[4px]"></div>
        <p className="text-gray-800 px-2">₩{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }

  return null;
};


const CustomLegend = () => {
  return (
    <ul className="flex flex-row gap-2 justify-center items-center">
      <li className="flex flex-row gap-2 items-center">
        <div className="w-2 h-2 bg-[#4F46E5] rounded-full"></div> 
        <p className="text-sm font-medium text-gray-400">총 비용</p>
      </li>
    </ul>
  );
};


export default function MonthlyTotalCostChart() {
  return (
    <div className="w-full h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#04101D"
          />
          <XAxis 
            dataKey="month"
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
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(4, 16, 29, 0.3)'}}/>
          <Legend content={<CustomLegend />} />
          <Bar
            dataKey="totalCost"
            name="총 비용"
            fill="url(#gradient-purple)"
            stroke="rgba(79, 70, 229, 0.7)"
            radius={[10, 10, 0, 0]}
            barSize={30}
          >
            <LabelList
              dataKey="totalCost"
              position="top"
              offset={10}
              formatter={(value: number) => `$${value.toLocaleString()}`}
              style={{ fill: '#EEEEEE', fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
