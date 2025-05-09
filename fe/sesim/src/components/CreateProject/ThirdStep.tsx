import { useDispatch, useSelector } from "react-redux";
import { SmallCard } from "./smallCard";
import { RootState } from "../../store";
import { FormStepHeader } from "./FormStepHeader"
import { setSelectedModels } from "../../store/createProjectInfoSlice";

interface ThirdStepProps {
    show: boolean;
    models: any[];
}

export const ThirdStep = ({ show, models }: ThirdStepProps) => {
    const dispatch = useDispatch();
    const selectedModels = useSelector((state: RootState) => state.createProjectInfo.selectedModels);

    const handleModelClick = (model: any) => {
        if (selectedModels.includes(model)) {
            dispatch(setSelectedModels(selectedModels.filter((name: any) => name !== model)));
        } else {
            dispatch(setSelectedModels([...selectedModels, model]));
        }
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
                <div className="mt-[15px] mr-[200px] grid grid-cols-3 gap-[20px]">
                    {models.map((model, idx) => (
                        <SmallCard
                            key={idx}
                            description={model.description}
                            modelName={model.name}
                            isSelected={selectedModels.includes(model)}
                            onClick={() => handleModelClick(model)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};