import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale,
    LinearScale,
    DoughnutController
} from "chart.js";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale,
    LinearScale,
    DoughnutController,
    ChartDataLabels
);

const centerTextPlugin = {
    id: "centerText",
    afterDraw: (chart: any) => {
        const { width, height, ctx } = chart;
        ctx.save();
        const text = chart.options.plugins?.centerText?.text || "0h";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "white";
        ctx.fillText(`총합: ${text}`, width / 2, height / 2.3);
        ctx.restore();
    }
};

interface ModelCost {
    modelName: string;
    cost: string;
    usageTime: string;
    apiRequests: number;
}

interface ProjectData {
    projectName: string;
    usageTime: string;
    totalCost: string;
    totalApiRequests: number;
    modelCosts: ModelCost[];
}

interface APIUsageListItemProps {
    data: ProjectData;
}

export const APIUsageListItem: React.FC<APIUsageListItemProps> = ({ data }) => {
    const totalUsageTime = data.modelCosts.reduce((acc, model) => acc + parseInt(model.usageTime), 0);

    const colors = ["#0038FF", "#CB3CFF", "#00C2FF", "#00FF99", "#FFCC00", "#FF4D4D"];

    const chartData = {
        labels: data.modelCosts.map((model) => model.modelName),
        datasets: [
            {
                data: data.modelCosts.map(
                    (model) => (parseInt(model.usageTime) / totalUsageTime) * 100
                ),
                backgroundColor: data.modelCosts.map((_, idx) => colors[idx % colors.length]),
                borderWidth: 0
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        cutout: "60%",
        plugins: {
            tooltip: {
                enabled: false
            },
            legend: {
                position: "bottom",
                labels: {
                    color: "white",
                    boxWidth: 6,
                    boxHeight: 6,
                    padding: 12
                }
            },
            centerText: {
                text: `${totalUsageTime}h`
            },
            datalabels: {
                color: "white",
                formatter: (value: number, context: any) => {
                    const label = context.chart.data.labels?.[context.dataIndex];
                    return `${label}\n${value.toFixed(1)}%`;
                },
                font: {
                    size: 14,
                    weight: "bold"
                },
                anchor: "center",
                align: "center",
                textAlign: "center"
            }
        },
        animation: {
            delay: 300, 
            duration: 1000, 
            easing: 'easeInOutQuad'
        }
    } as unknown as ChartOptions<"doughnut">;  

    return (
        <div
            className="w-full bg-darkitembg rounded-xl p-4 flex flex-col justify-start h-auto border border-slate-500"
            style={{
                boxShadow: "0px 0px 10px rgba(116, 208, 244, 0.2)",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            <h2 className="text-2xl font-bold text-white mb-4 ml-4">{data.projectName}</h2>

            <div className="flex my-6">
                <div className="w-1.5/5 flex justify-center items-center">
                    <Doughnut
                        data={chartData}
                        options={chartOptions}
                        plugins={[centerTextPlugin, ChartDataLabels]}
                    />
                </div>

                <table className="w-3/5 mx-auto text-white text-lg font-medium">
                    <thead>
                        <tr className="border-b border-gray-500">
                            <th className="px-4 py-2 text-center">모델명</th>
                            <th className="px-4 py-2 text-center">API 요청 수</th>
                            <th className="px-4 py-2 text-center">사용 시간</th>
                            <th className="px-4 py-2 text-center">비용</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.modelCosts.map((model, index) => (
                            <tr key={index} className="text-lg text-center">
                                <td className="px-4 py-2 text-center">{model.modelName}</td>
                                <td className="px-4 py-2 text-center">{model.apiRequests}</td>
                                <td className="px-4 py-2 text-center">{model.usageTime}</td>
                                <td className="px-4 py-2 text-center">{model.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-gray-500 font-semibold text-xl text-center">
                            <td className="px-4 py-2 text-2xl text-center">Total</td>
                            <td className="px-4 py-2 text-center">{data.totalApiRequests}</td>
                            <td className="px-4 py-2 text-center">{data.usageTime}</td>
                            <td className="px-4 py-2 text-center">{data.totalCost}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};