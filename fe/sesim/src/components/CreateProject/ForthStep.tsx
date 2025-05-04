import { useState, useEffect } from "react"
import { FormStepHeader } from "./FormStepHeader"

interface ForthStepProps {
    selectedModels: string[];
}

export const ForthStep = ({ selectedModels }: ForthStepProps) => {
    const [selectedModel, setSelectedModel] = useState<string>("")

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

    return (
        <div className="mt-[120px]">
            <FormStepHeader
                step="04"
                title="서버 사양 선택" 
                description="AI 모델별 하드웨어 구성 선택"
                must={true}
                information="서버 사양은 프로젝트 생성 이후 변경할 수 없습니다."
            />
            <div className="mt-[15px]">
                {selectedModels.length > 0 && (
                    <div className="flex w-fit">
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
                    <div className="mt-[20px] p-[15px] bg-[#242C4D] rounded-[10px] border-[#505671] border-[1px]">
                        <p className="text-[16px] font-bold mb-[10px]">선택된 모델:</p>
                        <p className="text-[16px] font-medium text-[#74D0F4]">{selectedModel}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
