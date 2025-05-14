import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { LuActivity, LuTrendingUp, LuWallet, LuClock, LuRadius, LuTableProperties } from "react-icons/lu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RootState } from "../store";
import { Sidebar } from "../components/Sidebar";
import { useAPIUsageSSE } from "../hooks/useAPIUsageSSE";
import { APIUsageListItem } from "../components/APIUsagePageComponents/APIUsageListItem";

interface ModelUsage {
    modelName: string;
    projects: {
        projectName: string;
        totalRequests: number;
        totalHours: number;
        totalCost: number;
    }[];
}

interface ChartData {
    modelName: string;
    [key: string]: string | number;
}

const GLASS_COLORS = [
    'rgba(255, 150, 170)',
    'rgba(255, 200, 150)',
    'rgba(255, 180, 150)',
    'rgba(200, 200, 255)',
    'rgba(150, 220, 180)',
    'rgba(255, 160, 180)'
];

const CHART_STYLES = {
    container: "flex flex-col px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full",
    title: "text-md font-semibold text-[#DEDEDE]",
    chartHeight: "h-[250px]",
    grid: {
        strokeDasharray: "3 3",
        stroke: "rgba(62, 72, 101, 0.15)",
        vertical: false
    },
    axis: {
        stroke: "#DEDEDE",
        tick: {
            fontSize: 13,
            fill: '#DEDEDE'
        },
        axisLine: {
            stroke: 'rgba(62, 72, 101, 0.2)'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(28, 34, 45, 0.95)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(62, 72, 101, 0.4)',
        borderRadius: '12px',
        color: '#FFFFFF !important',
        fontSize: '14px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        padding: '12px 16px',
        whiteSpace: 'pre-line'
    },
    legend: {
        paddingTop: '4px',
        paddingBottom: '4px',
        color: '#DEDEDE',
        fontSize: '14px',
        textAlign: 'right' as const
    },
    bar: {
        barSize: 30,
        radius: [4, 4, 0, 0] as [number, number, number, number],
        style: {
            filter: 'blur(0px)',
            backdropFilter: 'blur(20px)'
        }
    }
};

export const APIUsagePage: React.FC = () => {
    const projects = useSelector((state: RootState) => state.apiUsage.projects);

    useAPIUsageSSE();

    const transformModelUsage = (): ModelUsage[] => {

        const modelMap = new Map<string, ModelUsage>();

        projects.forEach(project => {
            project.models.forEach(model => {
                const existing = modelMap.get(model.modelName) || {
                    modelName: model.modelName,
                    projects: []
                };

                existing.projects.push({
                    projectName: project.projectName,
                    totalRequests: model.totalRequestCount,
                    totalHours: model.totalSeconds / 3600,
                    totalCost: model.totalCost
                });

                modelMap.set(model.modelName, existing);
            });
        });

        return Array.from(modelMap.values());
    };

    const modelUsageData = transformModelUsage();

    const formatChartData = () => {
        const formattedData = modelUsageData.map(model => {
            const data: ChartData = { modelName: model.modelName };
            model.projects.forEach(project => {
                data[`${project.projectName}_requests`] = project.totalRequests;
                data[`${project.projectName}_hours`] = project.totalHours;
                data[`${project.projectName}_cost`] = project.totalCost;
            });
            return data;
        });

        return formattedData.sort((a, b) => {
            const aTotal = projects.reduce((sum, project) => sum + (a[`${project.projectName}_cost`] as number || 0), 0);
            const bTotal = projects.reduce((sum, project) => sum + (b[`${project.projectName}_cost`] as number || 0), 0);
            return bTotal - aTotal;
        });
    };

    const chartData = formatChartData();

    const calculateTotalUsage = () => {
        const totalMap = new Map<string, { totalRequests: number; totalHours: number; totalCost: number }>();

        projects.forEach(project => {
            project.models.forEach(model => {
                const existing = totalMap.get(model.modelName) || {
                    totalRequests: 0,
                    totalHours: 0,
                    totalCost: 0
                };

                existing.totalRequests += model.totalRequestCount;
                existing.totalHours += model.totalSeconds / 3600;
                existing.totalCost += model.totalCost;

                totalMap.set(model.modelName, existing);
            });
        });

        return Array.from(totalMap.entries()).map(([modelName, data]) => ({
            name: modelName,
            value: data.totalCost,
            requests: data.totalRequests,
            hours: data.totalHours
        }));
    };

    const totalUsageData = calculateTotalUsage();

    const renderBarChart = (title: string, dataKey: string, icon: React.ReactNode) => {
        const recentProjects = projects.slice(-3);

        return (
            <div className={CHART_STYLES.container}>
                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] rounded-[16px] bg-[#242B3A] flex items-center justify-center">
                        {icon}
                    </div>
                    <p className={CHART_STYLES.title}>{title}</p>
                </div>
                <div className={CHART_STYLES.chartHeight}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                            barGap={2}
                            barCategoryGap={12}
                        >
                            <CartesianGrid {...CHART_STYLES.grid} />
                            <XAxis dataKey="modelName" {...CHART_STYLES.axis} />
                            <YAxis {...CHART_STYLES.axis} />
                            <Tooltip
                                contentStyle={CHART_STYLES.tooltip}
                                cursor={{ fill: 'rgba(62, 72, 101, 0.1)' }}
                            />
                            <Legend
                                wrapperStyle={CHART_STYLES.legend}
                                iconType="circle"
                                iconSize={8}
                                align="right"
                            />
                            {recentProjects.map((project, index) => (
                                <Bar
                                    key={`${project.projectName}_${dataKey}`}
                                    dataKey={`${project.projectName}_${dataKey}`}
                                    name={project.projectName}
                                    fill={GLASS_COLORS[index % GLASS_COLORS.length]}
                                    {...CHART_STYLES.bar}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen text-white container-padding">
            <div>
                <Sidebar />
            </div>

            <div className="my-[44px] ml-[44px] w-full h-full">
                <motion.div
                    className="flex flex-col flex-1"
                    style={{ zIndex: 1 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* 제목 */}
                    <motion.h1
                        className="text-2xl font-semibold flex items-center mb-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        API 사용량 / 금액
                    </motion.h1>

                    <motion.p
                        className="text-md font-medium text-[#DEDEDE]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        API 호출 이력과 비용 청구 내역을 기준으로 프로젝트 단위의 사용 리포트를 제공합니다.<br />
                        정량화된 사용 데이터를 기반으로 보안 모델 운영을 효율화하세요.
                    </motion.p>

                    {/* 통계 정보 */}
                    <div className="flex flex-col my-[32px] gap-6">
                        <div className="flex flex-row gap-6 w-full">
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">
                                <div className="w-[48px] h-[48px] rounded-[32px] bg-[#5F9FED] flex items-center justify-center">
                                    <LuActivity size={28} color="#242B3A" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-[#DEDEDE]">전체 API 사용량</p>
                                    <p className="text-2xl font-bold text-white">250</p>
                                </div>
                            </div>
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">
                                <div className="w-[48px] h-[48px] rounded-[32px] bg-[#88D6BE] flex items-center justify-center">
                                    <LuWallet size={28} color="#242B3A" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-[#DEDEDE]">전체 비용</p>
                                    <p className="text-2xl font-bold text-white">$100.12</p>
                                </div>
                            </div>
                            <div className="flex flex-row px-[24px] py-[16px] bg-[#242B3A] rounded-[20px] gap-5 w-full items-center">
                                <div className="w-[52px] h-[52px] rounded-[32px] bg-[#837CF7] flex items-center justify-center">
                                    <LuTrendingUp size={28} color="#242B3A" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-[#DEDEDE]">최대 비용 프로젝트</p>
                                    <p className="text-2xl font-bold text-white">Sesim</p>
                                </div>
                            </div>
                        </div>

                        {/* 그래프 */}
                        <div className="flex flex-row gap-6">
                            {renderBarChart("최근 3개 프로젝트 API 요청 수 비교", "requests", <LuActivity size={20} color="#DEDEDE" />)}
                            {renderBarChart("최근 3개 프로젝트 사용 시간 비교 (h)", "hours", <LuClock size={20} color="#DEDEDE" />)}
                        </div>

                        <div className="flex flex-row gap-6">
                            {renderBarChart("최근 3개 프로젝트 비용 비교 ($)", "cost", <LuWallet size={20} color="#DEDEDE" />)}

                            <div className={CHART_STYLES.container + " w-[30%]"}>
                                <div className="flex items-center gap-2">
                                    <div className="w-[32px] h-[32px] rounded-[16px] bg-[#242B3A] flex items-center justify-center">
                                        <LuRadius size={20} color="#DEDEDE" />
                                    </div>
                                    <p className={CHART_STYLES.title}>최근 3개 프로젝트 모델 사용 비율</p>
                                </div>
                                <div className={CHART_STYLES.chartHeight}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                                            <Pie
                                                data={totalUsageData.slice(-3)}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                outerRadius={80}
                                                innerRadius={56}
                                                paddingAngle={5}
                                                fill="#8884d8"
                                                stroke="rgba(62, 72, 101, 0)"
                                                dataKey="value"
                                            >
                                                {totalUsageData.slice(-3).map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={GLASS_COLORS[index % GLASS_COLORS.length]}
                                                        style={{
                                                            filter: 'blur(0px)',
                                                            backdropFilter: 'blur(20px)'
                                                        }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                itemStyle={{ color: '#FFFFFF' }}
                                                labelStyle={{ color: '#FFFFFF' }}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(28, 34, 45, 0.95)',
                                                    backdropFilter: 'blur(15px)',
                                                    border: '1px solid rgba(62, 72, 101, 0.4)',
                                                    borderRadius: '12px',
                                                    color: '#FFFFFF !important',
                                                    fontSize: '14px',
                                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                                    padding: '12px 16px',
                                                    whiteSpace: 'pre-line'
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={CHART_STYLES.legend}
                                                iconType="circle"
                                                iconSize={8}
                                                align="center"
                                                verticalAlign="bottom"
                                                formatter={(value, entry) => {
                                                    const name = typeof value === 'string' ? value.replace(/:$/, '') : value;
                                                    const percent = entry.payload && entry.payload.value
                                                        ? (entry.payload.value / totalUsageData.slice(-3).reduce((sum, item) => sum + item.value, 0)) * 100
                                                        : 0;
                                                    return `${name} (${percent.toFixed(0)}%)`;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* 프로젝트별 모델 사용량 비교 */}
                        <div className="flex flex-col px-[24px] pt-[16px] pb-[24px] bg-[#242B3A] rounded-[20px] gap-5 w-full">
                            <div className="flex flex-row items-center justify-start gap-2">
                                <div className="w-[32px] h-[32px] rounded-[16px] bg-[#242B3A] flex items-center justify-center">
                                    <LuTableProperties size={20} color="#DEDEDE" />
                                </div>
                                <p className="text-md font-semibold text-left text-[#DEDEDE]">
                                    프로젝트별 모델 사용량 비교
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                {projects.map((project, index) => (
                                    <motion.div
                                        key={project.projectId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <APIUsageListItem 
                                            data={{
                                                projectName: project.projectName,
                                                usageTime: project.projectTotalSeconds / 3600,
                                                totalCost: `$${project.projectTotalCost.toFixed(2)}`,
                                                totalApiRequests: project.projectTotalRequestCount,
                                                modelCosts: project.models.map((model) => ({
                                                    modelName: model.modelName,
                                                    cost: `$${model.totalCost.toFixed(2)}`,
                                                    usageTime: model.totalSeconds / 3600,
                                                    apiRequests: model.totalRequestCount,
                                                })),
                                            }}
                                            isFirst={index === 0}
                                            isLast={index === projects.length - 1}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
