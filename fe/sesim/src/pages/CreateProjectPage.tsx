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

    return (
        <div>
            <PageTitleImageWithText
                title="프로젝트 생성"
                description1="개인 맞춤형 AI 보안 프로젝트 생성"
                description2=""
                backgroundImage={backgroundImage}
            />

            <div className="container-padding text-white py-[120px]">
                <FirstStep setFirstStepDone={setFirstStepDone} />
                <div
                    className={`transition-all duration-500 ${firstStepDone ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden`}
                >
                    <SecondStep setSecondStepDone={setSecondStepDone} />
                </div>
                <div
                    className={`transition-all duration-500 ${secondStepDone ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden`}
                >
                    <ThirdStep selectedModels={selectedModels} setSelectedModels={setSelectedModels} />
                </div>
                <div
                    className={`transition-all duration-500 ${selectedModels.length > 0 ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden`}
                >
                    <ForthStep selectedModels={selectedModels} />
                </div>
            </div>
        </div>
    );
};
