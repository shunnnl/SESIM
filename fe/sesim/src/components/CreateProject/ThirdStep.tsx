import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, forwardRef, RefObject } from "react";
import { SmallCard } from "./smallCard";
import { RootState } from "../../store";
import { FormStepHeader } from "./FormStepHeader"
import { setSelectedModels } from "../../store/createProjectInfoSlice";

interface ThirdStepProps {
    show: boolean;
    models: any[];
    currentStep: number;
}

export const ThirdStep = forwardRef<HTMLDivElement, ThirdStepProps>(({ show, models, currentStep }, ref) => {
    const dispatch = useDispatch();
    const selectedModelsFromRedux = useSelector((state: RootState) => state.createProjectInfo.selectedModels);
    const [selectedModelList, setSelectedModelList] = useState<any[]>([]);

    useEffect(() => {
        if (show && ref && typeof ref !== "function" && (ref as RefObject<HTMLDivElement>).current) {
            setTimeout(() => {
                const el = (ref as RefObject<HTMLDivElement>).current!;
                const top = el.getBoundingClientRect().top + window.scrollY;
                const offset = 100;
                const scrollTo = Math.max(0, top - offset);
                window.scrollTo({ top: scrollTo, behavior: "smooth" });
            }, 100);
        }
    }, [show, ref]);

    useEffect(() => {
        if (show) {
            setSelectedModelList(selectedModelsFromRedux);
        }
    }, [show, selectedModelsFromRedux]);

    const handleModelClick = (model: any) => {
        if (selectedModelList.includes(model)) {
            setSelectedModelList(selectedModelList.filter((selectedModel: any) => selectedModel !== model));
        } else {
            setSelectedModelList([...selectedModelList, model]);
        }
    }

    const handleDone = () => {
        dispatch(setSelectedModels(selectedModelList));
    }

    return (
        <div
            ref={ref}
            className={`${show ? "block" : "hidden"} mt-[120px]`}
        >
            <FormStepHeader
                step="03"
                title="보안 AI 모델 선택" 
                information="모델은 프로젝트 생성 이후 변경할 수 없습니다."
                description1="프로젝트에 사용할 보안 AI 모델을 선택해주세요. (1개이상)"
                description2="각 모델은 탐지 대상과 분석 방식이 다르므로, 업무 목적에 맞는 모델을 선택하는 것이 중요합니다."
                currentStep={currentStep}
            />
            <div className="px-[20px] pb-[20px]">
                <div className="mt-[30px] mr-[200px] grid grid-cols-3 gap-[20px]">
                    {models.map((model, idx) => (
                        <SmallCard
                            key={idx}
                            description={model.description}
                            modelName={model.name}
                            isSelected={selectedModelList.includes(model)}
                            onClick={() => handleModelClick(model)}
                        />
                    ))}
                </div>
                <button 
                    className="mt-[30px] px-[20px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] p-[10px] flex flex-row items-center gap-[10px] h-[50px] hover:bg-[#3C4061] transition-colors duration-200 disabled:bg-[#44485e] disabled:text-[#A3A3A3] disabled:cursor-not-allowed"
                    onClick={handleDone}
                    disabled={selectedModelList.length < 1}
                >
                    <p className="text-[16px] font-medium">모델 선택 완료</p>
                </button>
            </div>
        </div>
    );
});