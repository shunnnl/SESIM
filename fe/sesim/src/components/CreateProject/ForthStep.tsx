import { BigCard } from "./BigCard"
import { useState, useEffect } from "react"
import { FormStepHeader } from "./FormStepHeader"
import awsIcon from "../../assets/images/aws.svg"
import azureIcon from "../../assets/images/azure.svg"
import gcpIcon from "../../assets/images/googlecloudplatform.svg"

interface ForthStepProps {
    selectedModels: string[];
    show: boolean;
}

export const ForthStep = ({ selectedModels, show }: ForthStepProps) => {
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [selectedAwsIdx, setSelectedAwsIdx] = useState<number>(0);
    const [selectedType, setSelectedType] = useState("CPU");
    const regions = [
        { name: "N.Virginia", code: "us-east-1" },
        { name: "Ohio", code: "us-east-2" },
        { name: "Seoul", code: "ap-northeast-2" },
    ];
    const [selectedRegion, setSelectedRegion] = useState(regions[0]);
    const instances = [
        {
            name: "Intel Sapphire Rapids",
            spec: "1 vCPU / 2GB",
            price: 0.033
        },
        {
            name: "Intel Sapphire Rapids",
            spec: "2 vCPUs / 4GB",
            price: 0.067
        },
        {
            name: "Intel Sapphire Rapids",
            spec: "4 vCPUs / 8GB",
            price: 0.134
        }
    ]
    const [selectedInstanceIdx, setSelectedInstanceIdx] = useState<number>(-1);
    const [selectedInstancePrice, setSelectedInstancePrice] = useState<number>(0);

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
        setSelectedInstancePrice(instances[idx].price);
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
                            {["Amazon Web Services", "Microsoft Azure", "Google Cloud Platform"].map((label, idx) => {
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
                            <div className="flex bg-[#F7F7F7] rounded-full p-[6px] w-fit" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.70)" }}>
                                {[
                                    "CPU", "GPU", "INF2"
                                ].map((type) => (
                                    <div
                                        key={type}
                                        className={`
                                            px-[22px] py-[6px] rounded-full text-[16px] font-medium
                                            cursor-pointer transition-colors
                                            ${selectedType === type
                                                ? "bg-[#3887FE] text-white"
                                                : "text-[#A3A3A3]"}
                                        `}
                                        onClick={() => setSelectedType(type)}
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>
                            <select
                                className="ml-2 px-3 py-2 rounded-full border border-[#D9D9D9] text-[16px] font-medium text-black bg-white"
                                value={selectedRegion.code}
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

                        <div className="flex gap-[20px] mt-[30px]">
                            {instances.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        w-[240px] h-[140px] bg-[#F7F8FA] rounded-[16px] p-[20px] flex flex-col items-center justify-between cursor-pointer
                                        border transition-all
                                        ${selectedInstanceIdx === idx
                                            ? "border-[3px] border-[#F97316] shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
                                            : "border border-[#D9D9D9]"}
                                    `}
                                    onClick={() => handleInstanceClick(idx)}
                                >
                                    <div className="w-full flex flex-col items-center">
                                        <div className="w-[36px] h-[6px] rounded-full bg-[#FBBF75] mb-[10px]" />
                                        <div className="text-[15px] font-bold text-black text-center">{item.name}</div>
                                    </div>
                                    <div className="text-[15px] font-medium text-[#7B7B7B] mt-[8px]">{item.spec}</div>
                                    <div className="text-[15px] font-bold text-[#A3A3A3] mt-[8px]">$ {item.price}/h</div>
                                </div>
                            ))}
                        </div>
                        
                    </BigCard>
                )}
            </div>
            
            <div className="mt-[40px]">
                {selectedInstancePrice > 0 && (
                    <div className="flex justify-between items-center border-t border-[#3C3D5C] bg-[#242C4D] py-[20px]">
                        <div>
                            <p className="text-[30px] font-bold text-[#3893FF]">$ {selectedInstancePrice} / h</p>
                            <p className="text-[16px] font-medium text-[#A3A3A3]">활성화된 인스턴스(서버) 당 요금</p>
                        </div>
                        <button className="bg-[#3893FF] text-white font-bold py-[10px] px-[20px] rounded-[5px] w-[200px]">
                            프로젝트 생성
                        </button>
                    </div>
                
                )}
            </div>
        </div>
    )
}
