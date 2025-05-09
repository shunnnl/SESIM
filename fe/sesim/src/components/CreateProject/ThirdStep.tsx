import { useDispatch, useSelector } from "react-redux";
import { SmallCard } from "./smallCard";
import { RootState } from "../../store";
import { FormStepHeader } from "./FormStepHeader"
import { setSelectedModels } from "../../store/createProjectInfoSlice";
import { useEffect, useState, forwardRef, RefObject } from "react";

interface ThirdStepProps {
    show: boolean;
    models: any[];

}

export const ThirdStep = forwardRef<HTMLDivElement, ThirdStepProps>(({ show, models }, ref) => {
    const dispatch = useDispatch();
    const selectedModelsFromRedux = useSelector((state: RootState) => state.createProjectInfo.selectedModels);
    const [selectedModels, setSelectedModelsLocal] = useState<any[]>([]);

    useEffect(() => {
        if (show && ref && typeof ref !== "function" && (ref as RefObject<HTMLDivElement>).current) {
            setTimeout(() => {
                const el = (ref as RefObject<HTMLDivElement>).current!;
                const top = el.getBoundingClientRect().top + window.scrollY;
                const offset = 100; // 상단 고정바 높이(px)
                const scrollTo = Math.max(0, top - offset);
                window.scrollTo({ top: scrollTo, behavior: "smooth" });
            }, 100);
        }
    }, [show, ref]);

    useEffect(() => {
        // show가 true가 될 때마다 redux에서 선택된 모델을 초기값으로 세팅
        if (show) {
            setSelectedModelsLocal(selectedModelsFromRedux);
        }
    }, [show, selectedModelsFromRedux]);

    const handleModelClick = (model: any) => {
        if (selectedModels.includes(model)) {
            setSelectedModelsLocal(selectedModels.filter((m: any) => m !== model));
        } else {
            setSelectedModelsLocal([...selectedModels, model]);
        }
    }

    const handleDone = () => {
        dispatch(setSelectedModels(selectedModels));
    }

    return (
        <div ref={ref} className={`${show ? "block" : "hidden"} mt-[120px]`}>
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
                <button 
                    className="mt-[30px] px-[20px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] p-[10px] flex flex-row items-center gap-[10px] h-[50px] hover:bg-[#3C4061] transition-colors duration-200 disabled:bg-[#44485e] disabled:text-[#A3A3A3] disabled:cursor-not-allowed"
                    onClick={handleDone}
                    disabled={selectedModels.length < 1}
                >
                    <p className="text-[16px] font-medium">모델 선택 완료</p>
                </button>
            </div>
        </div>
    );
});