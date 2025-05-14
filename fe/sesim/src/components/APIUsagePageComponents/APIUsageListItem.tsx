import { useState, useEffect } from "react";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { LuChevronDown } from "react-icons/lu";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, DoughnutController } from "chart.js";

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

interface ModelCost {
    modelName: string;
    cost: string;
    usageTime: number;
    apiRequests: number;
}

interface ProjectData {
    projectName: string;
    usageTime: number;
    totalCost: string;
    totalApiRequests: number;
    modelCosts: ModelCost[];
}

interface APIUsageListItemProps {
    data: ProjectData;
    isFirst?: boolean;
    isLast?: boolean;
    isExpanded?: boolean;
}

export const APIUsageListItem: React.FC<APIUsageListItemProps> = ({
    data,
    isFirst,
    isLast,
    isExpanded: initialExpanded
}) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    useEffect(() => {
        setIsExpanded(initialExpanded);
    }, [initialExpanded]);

    return (
        <div className="flex flex-col w-full">
            <div
                className={`flex flex-row justify-between items-center px-10 py-4 bg-[#111828] cursor-pointer
                    ${isFirst ? "rounded-t-[20px]" : ""}
                    ${isLast && !isExpanded ? "rounded-b-[20px]" : ""}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-row items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#9DC6FF]" />
                    <span className="text-[22px] font-medium text-white">{data.projectName}</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <span className="text-[17px] text-[#616365]">{isExpanded ? "접기" : "펼치기"}</span>
                    <LuChevronDown 
                        size={20} 
                        color="#616365"
                        className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {isExpanded && (
                <div className={`bg-[#343E57] px-8 py-8 ${isLast ? 'rounded-b-[20px]' : ''}`}>
                    <div className="flex flex-col lg:flex-row gap-8">

                        <div className="flex-1">
                            <div className="grid grid-cols-4 gap-4">
                                {/* 테이블 헤더 */}
                                <div className="col-span-4 grid grid-cols-4 gap-4 py-3 border-b border-[#3E4764]">
                                    <div className="text-center">
                                        <span className="text-[17px] font-medium text-[#9DC6FF]">모델명</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[17px] font-medium text-[#9DC6FF]">API 요청수</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[17px] font-medium text-[#9DC6FF]">사용시간</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[17px] font-medium text-[#9DC6FF]">금액</span>
                                    </div>
                                </div>

                                {/* 테이블 본문 */}
                                {data.modelCosts.map((model, index) => (
                                    <div 
                                        key={index} 
                                        className="col-span-4 grid grid-cols-4 gap-4 py-2 border-b border-[#36405D] last:border-b-0"
                                    >
                                        <div className="text-center">
                                            <span className="text-[15px] text-white">{model.modelName}</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[15px] text-white">{model.apiRequests.toLocaleString()}</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[15px] text-white">{model.usageTime.toFixed(1)}h</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[15px] text-white">{model.cost}</span>
                                        </div>
                                    </div>
                                ))}

                                {/* 테이블 푸터 */}
                                <div className="col-span-4 grid grid-cols-4 gap-4 py-2 border-t justify-center border-[#3E4764] bg-[#242B3A] rounded-[10px]">
                                    <div className="text-center items-center">
                                        <span className="text-[17px] font-medium text-[#9DC6FF]">Total</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[17px] font-medium text-white">{data.totalApiRequests.toLocaleString()}</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[17px] font-medium text-white">{data.usageTime.toFixed(1)}h</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[17px] font-medium text-white">{data.totalCost}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};