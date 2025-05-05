import { useState } from "react";
import { FirstStep } from "../components/CreateProject/FirstStep";
import { ThirdStep } from "../components/CreateProject/ThirdStep";
import { ForthStep } from "../components/CreateProject/ForthStep";
import { SecondStep } from "../components/CreateProject/SecondStep";
import backgroundImage from "../assets/images/create-project-bg.png";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";

export const CreateProjectPage = () => {
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [firstStepDone, setFirstStepDone] = useState(false);
    const [secondStepDone, setSecondStepDone] = useState(false);
    const [selectedInstancePrice, setSelectedInstancePrice] = useState<number>(0);

    return (
        <div>
            <PageTitleImageWithText
                title="프로젝트 생성"
                description1="개인 맞춤형 AI 보안 프로젝트 생성"
                description2=""
                backgroundImage={backgroundImage}
            />

            <div className="container-padding text-white pt-[88px]">
                <FirstStep show={true} setFirstStepDone={setFirstStepDone} />
                <SecondStep show={firstStepDone} setSecondStepDone={setSecondStepDone} />
                <ThirdStep show={secondStepDone} selectedModels={selectedModels} setSelectedModels={setSelectedModels} />
                <ForthStep show={selectedModels.length > 0} selectedModels={selectedModels} selectedInstancePrice={selectedInstancePrice} setSelectedInstancePrice={setSelectedInstancePrice} />
            </div>
            
            <div className="mt-[100px]">
                <div className={`transition-all duration-500 ${selectedModels.length > 0 && selectedInstancePrice > 0 ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden`}>
                    <div className="container-padding flex justify-between items-center border-t border-[#3C3D5C] bg-[#242C4D] py-[20px] mt-[40px]">
                        <div>
                            <p className="text-[30px] font-bold text-[#3893FF]">$ {selectedInstancePrice} / h</p>
                            <p className="text-[16px] font-medium text-[#A3A3A3]">활성화된 인스턴스(서버) 당 요금</p>
                        </div>
                        <button className="bg-[#3893FF] text-white font-bold py-[10px] px-[20px] rounded-[5px] w-[200px]">
                            프로젝트 생성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
