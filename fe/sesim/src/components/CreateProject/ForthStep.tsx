import { useState, useEffect } from "react"
import { BigCard } from "./BigCard"
import { FormStepHeader } from "./FormStepHeader"
import awsIcon from "../../assets/images/aws.svg"
import azureIcon from "../../assets/images/azure.svg"
import gcpIcon from "../../assets/images/googlecloudplatform.svg"

const CLOUD_PROVIDERS = ["Amazon Web Services", "Microsoft Azure", "Google Cloud Platform"];

interface ForthStepProps {
    selectedModels: string[];
    show: boolean;
    regions: any[];
    infrastructure: any[];
    setSelectedInstancePrice: (price: number) => void;
}

export const ForthStep = ({ selectedModels, show, regions, infrastructure, setSelectedInstancePrice }: ForthStepProps) => {
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [selectedAwsIdx, setSelectedAwsIdx] = useState<number>(0);
    const [selectedType, setSelectedType] = useState("CPU");
    const [selectedRegion, setSelectedRegion] = useState<any>(null);
    const [selectedInstanceIdx, setSelectedInstanceIdx] = useState<number>(-1);

    useEffect(() => {
        if (regions && regions.length > 0) {
            setSelectedRegion(regions[0]);
        }
    }, [regions]);

    useEffect(() => {
        if (selectedModels.length > 0) {
            setSelectedModel(selectedModels[0]);
        } else {
            setSelectedModel("");
        }
    }, [selectedModels]);

    const handleModelClick = (model: string) => {
        if (selectedModel === model) {
            setSelectedModel("") // 같은 모델을 다시 클릭하면 선택 해제
        } else {
            setSelectedModel(model)
        }
    }


    const handleInstanceClick = (idx: number) => {
        setSelectedInstanceIdx(idx);
        setSelectedInstancePrice(infrastructure[idx].specPricePerHour);
    }
    
    return (
        <div className={`transition-all duration-500 ${show ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden mt-[120px]`}>
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
                        {selectedModels.map((model, idx) => (
                            <div
                                key={model}
                                onClick={() => handleModelClick(model)}
                                className={`flex text-center py-3 px-8 cursor-pointer select-none
                                    border border-[#6A789A] text-white
                                    transition-colors duration-200
                                    ${selectedModel === model ? "bg-[#475B7A] font-bold" : "bg-[#2C304B]"}
                                    ${idx === 0 ? "rounded-l-[16px]" : ""}
                                    ${idx === selectedModels.length - 1 ? "rounded-r-[16px]" : ""}
                                    ${idx !== 0 ? "border-l-0" : ""}
                                `}
                                style={{ minWidth: 120 }}
                            >
                                {model}
                            </div>
                        ))}
                    </div>
                )}

                {selectedModel && (
                    <BigCard>
                        <div className="flex flex-row gap-[30px]">
                            {CLOUD_PROVIDERS.map((label, idx) => {
                                const isDisabled = label !== "Amazon Web Services";
                                return (
                                    <button
                                        key={idx}
                                        className={`flex items-center gap-[10px] rounded-[5px] px-[20px] py-[10px] w-[250px]
                                            ${selectedAwsIdx === idx && !isDisabled
                                                ? "border-[#F97316] border-[3px] bg-[#FFFFFF]"
                                                : "border border-[#D9D9D9] bg-[#FFFFFF]"}
                                            ${isDisabled ? "cursor-not-allowed" : ""}
                                        `}
                                        onClick={() => !isDisabled && setSelectedAwsIdx(idx)}
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

                        <div className="mt-[20px] flex flex-row gap-[10px]">
                            <div 
                                className="flex bg-[#F7F7F7] rounded-full p-[6px] w-fit"
                                style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.70)" }}
                            >
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
                                            ${selectedType === type && !disabled
                                                ? "bg-[#3887FE] text-white"
                                                : "text-[#A3A3A3]"}
                                        `}
                                        onClick={() => !disabled && setSelectedType(type)}
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>
                            <select
                                className="ml-2 px-3 py-2 rounded-full border border-[#D9D9D9] text-[16px] font-medium text-black bg-white"
                                value={selectedRegion?.code}
                                onChange={e => {
                                    const region = regions.find(r => r.code === e.target.value);
                                    if (region) setSelectedRegion(region);
                                }}
                            >
                                {regions.map(region => (
                                    <option key={region.code} value={region.code}>
                                        {region.name} ({region.code})
                                    </option>
                                ))}
                            </select>
                            <div className="w-full h-[1px] bg-[#D9D9D9] mt-[20px]"></div>
                        </div>

                        <div className="grid grid-cols-4 gap-[20px] mt-[30px]">
                            {infrastructure.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        w-full h-[140px] bg-[#F7F8FA] rounded-[16px] p-[20px] flex flex-col items-center justify-between cursor-pointer
                                        border transition-all
                                        ${selectedInstanceIdx === idx
                                            ? "border-[3px] border-[#F97316] shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
                                            : "border border-[#D9D9D9]"}
                                    `}
                                    onClick={() => handleInstanceClick(idx)}
                                >
                                    <div className="w-full flex flex-col items-center">
                                        <div className="w-[36px] h-[6px] rounded-full bg-[#FBBF75] mb-[10px]" />
                                        <div className="text-[15px] font-bold text-black text-center">{item.ec2Spec}</div>
                                    </div>
                                    <div className="text-[15px] font-medium text-[#7B7B7B] mt-[8px]">{item.ec2Info}</div>
                                    <div className="text-[15px] font-bold text-[#A3A3A3] mt-[8px]">$ {item.specPricePerHour}/h</div>
                                </div>
                            ))}
                        </div>
                        
                    </BigCard>
                )}
            </div>
        </div>
    )
};
