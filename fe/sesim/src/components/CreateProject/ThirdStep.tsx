import { Dispatch, SetStateAction } from "react"
import { SmallCard } from "./smallCard"
import { FormStepHeader } from "./FormStepHeader"

interface ThirdStepProps {
    selectedModels: string[];
    setSelectedModels: Dispatch<SetStateAction<string[]>>;
    show: boolean;
}

export const ThirdStep = ({ selectedModels, setSelectedModels, show }: ThirdStepProps) => {

    const handleModelClick = (modelName: string) => {
        setSelectedModels(prev => {
            if (prev.includes(modelName)) {
                return prev.filter((name: string) => name !== modelName)
            } else {
                return [...prev, modelName]
            }
        })
    }

    return (
        <div className={`transition-all duration-500 ${show ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden mt-[120px]`}>
            <FormStepHeader
                step="03"
                title="보안 AI 모델 선택" 
                description="사용할 보안 AI 모델을 선택해 주세요 (1개이상)"
                must={true}
                information="모델은 프로젝트 생성 이후 변경할 수 없습니다."
            />
            <div className="px-[20px] pb-[20px]">
                <div className="mt-[15px] flex flex-row gap-[40px]">
                    <SmallCard
                        description="우리 팀의 믓쟁이 팀장"
                        modelName="손은주 모델"
                        isSelected={selectedModels.includes("손은주 모델")}
                        onClick={() => handleModelClick("손은주 모델")}
                    />
                    <SmallCard
                        description="도대체 모르는게 없는 똑똑이"
                        modelName="박진훈 모델"
                        isSelected={selectedModels.includes("박진훈 모델")}
                        onClick={() => handleModelClick("박진훈 모델")}
                    />
                    <SmallCard
                        description="알아서 척척 귀염둥이 막내"
                        modelName="하시윤 모델"
                        isSelected={selectedModels.includes("하시윤 모델")}
                        onClick={() => handleModelClick("하시윤 모델")}
                    />
                </div>
                <div className="mt-[15px] flex flex-row gap-[40px]">
                    <SmallCard
                        description="못하는게없는 자칭 말하는 감자"
                        modelName="안주현 모델"
                        isSelected={selectedModels.includes("안주현 모델")}
                        onClick={() => handleModelClick("안주현 모델")}
                    />
                    <SmallCard
                        description="칭찬에목말라있는쪼그라든포도"
                        modelName="배지해 모델"
                        isSelected={selectedModels.includes("배지해 모델")}
                        onClick={() => handleModelClick("배지해 모델")}
                    />
                    <SmallCard
                        description="그냥 자기만들고싶은대로 만들고있는 (아 뭐요!!)"
                        modelName="심근원 모델"
                        isSelected={selectedModels.includes("심근원 모델")}
                        onClick={() => handleModelClick("심근원 모델")}
                    />
                </div>
            </div>
        </div>
    )
};