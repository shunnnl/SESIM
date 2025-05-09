import { useDispatch, useSelector } from "react-redux";
import { SmallCard } from "./smallCard";
import { RootState } from "../../store";
import { FormStepHeader } from "./FormStepHeader"
import { setSelectedModels } from "../../store/createProjectInfoSlice";
import { useEffect, forwardRef, RefObject } from "react";

interface ThirdStepProps {
    show: boolean;
    models: any[];
}

export const ThirdStep = forwardRef<HTMLDivElement, ThirdStepProps>(({ show, models }, ref) => {
    const dispatch = useDispatch();
    const selectedModels = useSelector((state: RootState) => state.createProjectInfo.selectedModels);

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

    const handleModelClick = (model: any) => {
        if (selectedModels.includes(model)) {
            dispatch(setSelectedModels(selectedModels.filter((name: any) => name !== model)));
        } else {
            dispatch(setSelectedModels([...selectedModels, model]));
        }
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
            </div>
        </div>
    );
});