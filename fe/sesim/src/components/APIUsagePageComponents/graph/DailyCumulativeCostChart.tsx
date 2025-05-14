import { AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList, Area } from 'recharts';

const generateDummyData = () => {
    const startDate = new Date(2025, 3, 1);
    const endDate = new Date(2025, 5, 14);
    const data = [];
    let cumulativeTotal = 0;

    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        const dailyUsage = isWeekend 
            ? Math.floor(Math.random() * 50) + 30
            : Math.floor(Math.random() * 150) + 100;

        cumulativeTotal += dailyUsage;

        data.push({
            date: currentDate.toISOString().slice(0, 10),
            dailyUsage: dailyUsage,
            cumulativeTotal: cumulativeTotal,
            formattedDate: `${currentDate.getFullYear()}년 ${String(currentDate.getMonth() + 1).padStart(2, '0')}월 ${String(currentDate.getDate()).padStart(2, '0')}일`
        });
    }
    return data;
};

export const dailyUsageData = generateDummyData();

export const chartData = dailyUsageData.map(item => ({
    day: item.formattedDate,
    dailyUsage: item.dailyUsage,
    totalAPI: item.cumulativeTotal
}));

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
        <p className="text-sm font-medium text-gray-400">총 누적 비용</p>
      </li>
    </ul>
  );
};


export default function MonthlyTotalCostChart() {
  return (
    <div className="w-full h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
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
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(4, 16, 29, 0.3)'}}/>
          <Legend content={<CustomLegend />} />
          <Area
            dataKey="totalAPI"
            name="총 누적 비용"
            fill="url(#gradient-blue)"
            stroke="rgba(3, 52, 134, 0.7)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
