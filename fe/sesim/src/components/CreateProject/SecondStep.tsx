import { useDispatch } from "react-redux";
import { useState, useEffect, forwardRef, RefObject } from "react"
import { BigCard } from "./BigCard"
import { FormStepHeader } from "./FormStepHeader"
import { setProjectInfo } from "../../store/createProjectInfoSlice";

interface SecondStepProps {
    show: boolean;
    setSecondStepDone: (done: boolean) => void;
    currentStep: number;
}

export const SecondStep = forwardRef<HTMLDivElement, SecondStepProps>(({ setSecondStepDone, show, currentStep }, ref) => {
    const [isNameValid, setIsNameValid] = useState<"none" | "success" | "fail">("none");
    const [tempName, setTempName] = useState("");
    const [tempDesc, setTempDesc] = useState("");

    const dispatch = useDispatch();

    const handleSave = () => {

        if (tempName.trim() === "") {
            setIsNameValid("fail");
            return;
        }
        else {
            setIsNameValid("success");
        }

        dispatch(setProjectInfo({
            projectName: tempName,
            projectDescription: tempDesc,
        }));
        setSecondStepDone(true);
    }

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

    return (
        <div
            ref={ref}
            className={`mt-[120px] ${show ? "block" : "hidden"}`}
        >
            <FormStepHeader
                step="02"
                title="프로젝트 기본 정보" 
                description="프로젝트는 여러 보안 AI 모델을 관리하는 단위입니다. 프로젝트 이름과 설명을 입력하여 AI 모델들을 체계적으로 관리할 수 있습니다."
                currentStep={currentStep}
            />
            <div className="mt-[15px]">
                <BigCard>
                    <div>
                        <p className="text-[16px] font-bold">프로젝트 이름 <span className="text-[#FF7E7E]">*</span></p>
                        <input 
                            type="text"
                            maxLength={100}
                            className="mt-[10px] w-full bg-transparent border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#ffffff] placeholder:text-[#A3A3A3]" 
                            placeholder="예: 보안 모니터링 프로젝트, 이상행위 탐지 시스템"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                        />
                        {isNameValid === "fail" && 
                            <p className="text-[#FF7E7E] text-[16px] mt-[5px]">프로젝트 이름을 입력해주세요.</p>
                        }
                    </div>
                    <div className="mt-[15px]">
                        <p className="text-[16px] font-bold">프로젝트 설명</p>
                        <textarea 
                            maxLength={500}
                            className="mt-[10px] w-full bg-transparent border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#ffffff] placeholder:text-[#A3A3A3] min-h-[200px] resize-y" 
                            placeholder="이 프로젝트에서 관리할 보안 AI 모델들의 목적과 용도를 설명해주세요."
                            value={tempDesc}
                            onChange={(e) => setTempDesc(e.target.value)}
                        />
                    </div>
                    <button className="mt-[10px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] p-[10px] flex flex-row items-center gap-[10px] h-[50px] hover:bg-[#3C4061] transition-colors duration-200 ml-auto" onClick={handleSave}>
                        프로젝트 정보 저장
                    </button>
                </BigCard>
            </div>
        </div>
    );
});