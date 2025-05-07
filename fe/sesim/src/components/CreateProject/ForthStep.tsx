import { useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { BigCard } from "./BigCard"
import { FormStepHeader } from "./FormStepHeader"
import awsIcon from "../../assets/images/aws.svg"
import azureIcon from "../../assets/images/azure.svg"
import gcpIcon from "../../assets/images/googlecloudplatform.svg"
import { setModelConfigs } from "../../store/createProjectInfoSlice"

const CLOUD_PROVIDERS = ["Amazon Web Services", "Microsoft Azure", "Google Cloud Platform"];

interface ForthStepProps {
    show: boolean;
    regions: any[];
    infrastructure: any[];
    selectedModels: any[];
    combinedPrices: any[];
    setSelectedInstancePrice: (price: number) => void;
    onInstanceMapChange?: (map: { [modelId: string]: number }) => void;
}

export const ForthStep = ({ selectedModels, show, regions, infrastructure, combinedPrices, setSelectedInstancePrice, onInstanceMapChange }: ForthStepProps) => {
    const [selectedModel, setSelectedModel] = useState<any>(null);
    const [selectedAwsIdxMap, setSelectedAwsIdxMap] = useState<{ [modelId: string]: number }>({});
    const [selectedTypeMap, setSelectedTypeMap] = useState<{ [modelId: string]: string }>({});
    const [selectedRegionMap, setSelectedRegionMap] = useState<{ [modelId: string]: any }>({});
    const [selectedInstanceIdxMap, setSelectedInstanceIdxMap] = useState<{ [modelId: string]: number }>({});
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedModels.length > 0) {
            setSelectedModel(selectedModels[0]);
        } else {
            setSelectedModel(null);
        }
    }, [selectedModels]);

    useEffect(() => {
        if (selectedModel && regions.length > 0 && !selectedRegionMap[selectedModel.id]) {
            setSelectedRegionMap(prev => ({
                ...prev,
                [selectedModel.id]: regions[0]
            }));
        }
        if (selectedModel && !selectedAwsIdxMap[selectedModel.id]) {
            setSelectedAwsIdxMap(prev => ({
                ...prev,
                [selectedModel.id]: 0
            }));
        }
        if (selectedModel && !selectedTypeMap[selectedModel.id]) {
            setSelectedTypeMap(prev => ({
                ...prev,
                [selectedModel.id]: "CPU"
            }));
        }
    }, [selectedModel, regions]);

    useEffect(() => {
        let sum = 0;
        selectedModels.forEach(model => {
            const specIdx = selectedInstanceIdxMap[model.id];
            const spec = infrastructure[specIdx];
            if (spec) {
                // combinedPrices에서 해당 모델-사양 조합의 가격 찾기
                const combinedPrice = combinedPrices.find(
                    (cp) => cp.modelId === model.id && cp.specId === spec.id
                );
                if (combinedPrice) {
                    sum += combinedPrice.totalPricePerHour;
                }
            }
        });
        setSelectedInstancePrice(sum);
    }, [selectedModels, selectedInstanceIdxMap, infrastructure, combinedPrices, setSelectedInstancePrice]);

    useEffect(() => {
        const configs = selectedModels.map(model => {
            const specIdx = selectedInstanceIdxMap[model.id];
            const spec = infrastructure[specIdx];
            const region = selectedRegionMap[model.id];
            return {
                modelId: model.id,
                specId: spec ? spec.id : null,
                regionId: region ? region.id : null,
            };
        });
        dispatch(setModelConfigs(configs));
    }, [selectedModels, selectedInstanceIdxMap, selectedRegionMap, infrastructure, dispatch]);

    useEffect(() => {
        if (onInstanceMapChange) {
            onInstanceMapChange(selectedInstanceIdxMap);
        }
    }, [selectedInstanceIdxMap, onInstanceMapChange]);

    const handleModelClick = (model: any) => {
        setSelectedModel(model);
    };
    const handleAwsClick = (model: any, idx: number) => {
        setSelectedAwsIdxMap(prev => ({
            ...prev,
            [model.id]: idx
        }));
    };
    const handleTypeClick = (model: any, type: string) => {
        setSelectedTypeMap(prev => ({
            ...prev,
            [model.id]: type
        }));
    };
    const handleRegionChange = (model: any, code: string) => {
        const region = regions.find(r => r.code === code);
        if (region) {
            setSelectedRegionMap(prev => ({
                ...prev,
                [model.id]: region
            }));
        }
    };
    const handleInstanceClick = (model: any, idx: number) => {
        setSelectedInstanceIdxMap(prev => {
            // 이미 선택된 사양을 한 번 더 클릭하면 해제
            if (prev[model.id] === idx) {
                const newMap = { ...prev };
                delete newMap[model.id];
                return newMap;
            } else {
                return {
                    ...prev,
                    [model.id]: idx
                };
            }
        });
    };

    return (
        <div className={`transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden mt-[120px]`}>
            <FormStepHeader
                step="04"
                title="서버 사양 선택" 
                description="AI 모델별 하드웨어 구성 선택"
                must={true}
                information="서버 사양은 프로젝트 생성 이후 변경할 수 없습니다."
            />
            <div className="mt-[15px]">
                {selectedModels.length > 0 && (
                    <div className="flex w-fit mb-[15px]">
                        {[...selectedModels]
                            .sort((a, b) => Number(a.id) - Number(b.id))
                            .map((model, idx) => (
                            <div
                                key={model.id}
                                onClick={() => handleModelClick(model)}
                                className={`flex text-center py-3 px-8 cursor-pointer select-none
                                    border border-[#6A789A] text-white
                                    transition-colors duration-200
                                    ${selectedModel && selectedModel.id === model.id ? "bg-[#475B7A] font-bold" : "bg-[#2C304B]"}
                                    ${idx === 0 ? "rounded-l-[16px]" : ""}
                                    ${idx === selectedModels.length - 1 ? "rounded-r-[16px]" : ""}
                                    ${idx !== 0 ? "border-l-0" : ""}
                                `}
                                style={{ minWidth: 120 }}
                            >
                                {model.name}
                            </div>
                        ))}
                    </div>
                )}

                {selectedModel && (
                    <BigCard>
                        {/* 클라우드 제공자 */}
                        <div className="flex flex-row gap-[30px]">
                            {CLOUD_PROVIDERS.map((label, idx) => {
                                const isDisabled = label !== "Amazon Web Services";
                                return (
                                    <button
                                        key={idx}
                                        className={`flex items-center gap-[10px] rounded-[5px] px-[20px] py-[10px] w-[250px]
                                            ${selectedAwsIdxMap[selectedModel.id] === idx && !isDisabled
                                                ? "border-[#F97316] border-[3px] bg-[#FFFFFF]"
                                                : "border border-[#D9D9D9] bg-[#FFFFFF]"}
                                            ${isDisabled ? "cursor-not-allowed" : ""}
                                        `}
                                        onClick={() => !isDisabled && handleAwsClick(selectedModel, idx)}
                                        disabled={isDisabled}
                                    >
                                        {label === "Amazon Web Services" && (
                                            <img src={awsIcon} alt="aws" className={`w-[28px] h-[18px] ${isDisabled ? "grayscale" : ""}`} />
                                        )}
                                        {label === "Microsoft Azure" && (
                                            <img src={azureIcon} alt="azure" className={`w-[28px] h-[22px] ${isDisabled ? "grayscale" : ""}`} />
                                        )}
                                        {label === "Google Cloud Platform" && (
                                            <img src={gcpIcon} alt="gcp" className={`w-[28px] h-[30px] ${isDisabled ? "grayscale" : ""}`} />
                                        )}
                                        <p className={`text-[16px] font-medium ${isDisabled ? "text-[#A3A3A3]" : "text-[#000000]"}`}>{label}</p>
                                    </button>
                                );
                            })}
                        </div>
                        {/* 타입 */}
                        <div className="mt-[20px] flex flex-row gap-[10px]">
                            <div className="flex bg-[#F7F7F7] rounded-full p-[6px] w-fit" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.70)" }}>
                                {[
                                    { type: "CPU", disabled: false },
                                    { type: "GPU", disabled: true },
                                    { type: "INF2", disabled: true }
                                ].map(({ type, disabled }) => (
                                    <div
                                        key={type}
                                        className={`
                                            px-[22px] py-[6px] rounded-full text-[16px] font-medium
                                            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                                            transition-colors
                                            ${selectedTypeMap[selectedModel.id] === type && !disabled
                                                ? "bg-[#3887FE] text-white"
                                                : "text-[#A3A3A3]"}
                                        `}
                                        onClick={() => !disabled && handleTypeClick(selectedModel, type)}
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>
                            {/* 리전 */}
                            <select
                                className="ml-2 px-3 py-2 rounded-full border border-[#D9D9D9] text-[16px] font-medium text-black bg-white"
                                value={selectedRegionMap[selectedModel.id]?.code}
                                onChange={e => handleRegionChange(selectedModel, e.target.value)}
                            >
                                {regions.map(region => (
                                    <option key={region.code} value={region.code}>
                                        {region.name} ({region.code})
                                    </option>
                                ))}
                            </select>
                            <div className="w-full h-[1px] bg-[#D9D9D9] mt-[20px]"></div>
                        </div>
                        {/* 인스턴스 */}
                        <div className="grid grid-cols-4 gap-[20px] mt-[30px]">
                            {infrastructure.map((item, idx) => {
                                // 현재 모델과 사양에 맞는 totalPricePerHour 찾기
                                const combinedPrice = combinedPrices.find(
                                    (cp) => cp.modelId === selectedModel.id && cp.specId === item.id
                                );
                                return (
                                    
                                    <div
                                        key={idx}
                                        className={`
                                            w-full h-[140px] bg-[#F7F8FA] rounded-[16px] p-[20px] flex flex-col items-center justify-between cursor-pointer
                                            border transition-all
                                            ${selectedInstanceIdxMap[selectedModel.id] === idx
                                                ? "border-[3px] border-[#F97316] shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
                                                : "border border-[#D9D9D9]"}
                                        `}
                                        onClick={() => handleInstanceClick(selectedModel, idx)}
                                    >
                                        <div className="w-full flex flex-col items-center">
                                            <div className="w-[36px] h-[6px] rounded-full bg-[#FBBF75] mb-[10px]" />
                                            <div className="text-[15px] font-bold text-black text-center">{item.ec2Spec}</div>
                                        </div>
                                        <div className="text-[15px] font-medium text-[#7B7B7B] mt-[8px]">{item.ec2Info}</div>
                                        <div className="text-[15px] font-bold text-[#A3A3A3] mt-[8px]">
                                            $ {combinedPrice ? combinedPrice.totalPricePerHour.toFixed(2) : '-'} /h
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </BigCard>
                )}
            <div className="mt-8">
                <div className="text-xl font-bold mb-2 text-[#3893FF]">모델별 선택 상세</div>
                <div className="flex flex-col gap-2">
                    {[...selectedModels]
                        .sort((a, b) => Number(a.id) - Number(b.id))
                        .map((model) => {
                        const specIdx = selectedInstanceIdxMap[model.id];
                        const spec = infrastructure[specIdx];
                        const region = selectedRegionMap[model.id];
                        const combinedPrice = spec
                            ? combinedPrices.find(
                                (cp) => cp.modelId === model.id && cp.specId === spec.id
                            )
                            : null;
                        return (
                            <div
                                key={model.id}
                                className="flex flex-row items-center gap-6 bg-[#23294a] rounded-lg px-6 py-3"
                            >
                                <span className="font-bold text-white min-w-[120px] max-w-[180px] flex-1 truncate">{model.name}</span>
                                <span className="text-[#A3A3A3] min-w-[180px] max-w-[260px] flex-1 truncate">
                                    {spec ? `${spec.ec2Spec} (${spec.ec2Info})` : "사양 미선택"}
                                </span>
                                <span className="text-[#A3A3A3] min-w-[180px] max-w-[260px] flex-1 truncate">
                                    {region ? `${region.name}` : "리전 미선택"}
                                </span>
                                <span className="text-[#3893FF] font-bold min-w-[100px] text-right flex-shrink-0">
                                    {combinedPrice ? `$ ${combinedPrice.totalPricePerHour.toFixed(2)} / h` : "-"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            </div>
        </div>
    )
};
