import { useDispatch } from "react-redux";
import { useState } from "react"
import { BigCard } from "./BigCard"
import { FormStepHeader } from "./FormStepHeader"
import { setProjectInfo } from "../../store/createProjectInfoSlice";

interface SecondStepProps {
    show: boolean;
    setSecondStepDone: (done: boolean) => void;
}

export const SecondStep = ({ setSecondStepDone, show }: SecondStepProps) => {
    // 임시 입력값 상태
    const [tempName, setTempName] = useState("");
    const [tempDesc, setTempDesc] = useState("");

    const dispatch = useDispatch();

    const handleSave = () => {
        dispatch(setProjectInfo({
            projectName: tempName,
            projectDescription: tempDesc,
        }));
        setSecondStepDone(true);
    }

    return (
        <div className={`mt-[120px] transition-all duration-500 ${show ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden`}>
            <FormStepHeader
                step="02"
                title="프로젝트 기본 정보" 
                description="생성할 프로젝트의 이름과 설명을 입력해주세요."
            />
            <div className="mt-[15px]">
                <BigCard>
                    <div>
                        <p className="text-[16px] font-bold">프로젝트 이름 <span className="text-[#FF7E7E]">*</span></p>
                        <input 
                            type="text" 
                            className="mt-[10px] w-full bg-transparent border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#ffffff] placeholder:text-[#A3A3A3]" 
                            placeholder="프로젝트 이름을 입력해주세요"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                        />
                    </div>
                    <div className="mt-[15px]">
                        <p className="text-[16px] font-bold">프로젝트 설명</p>
                        <textarea 
                            className="mt-[10px] w-full bg-transparent border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#ffffff] placeholder:text-[#A3A3A3] min-h-[200px] resize-y" 
                            placeholder="프로젝트 설명을 입력해주세요"
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
    )
};