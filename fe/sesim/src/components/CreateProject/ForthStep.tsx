import { FormStepHeader } from "./FormStepHeader"

interface ForthStepProps {
    selectedModels: string[];
}

export const ForthStep = ({ selectedModels }: ForthStepProps) => {
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
                <div className="p-[20px] bg-[#242C4D] rounded-[10px]">
                    <p className="text-[16px] font-bold mb-[10px]">선택된 모델:</p>
                    <div className="flex flex-wrap gap-[10px]">
                        {selectedModels.map(model => (
                            <span key={model} className="px-[15px] py-[5px] bg-[#3C4061] rounded-[5px] text-[14px]">
                                {model}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
