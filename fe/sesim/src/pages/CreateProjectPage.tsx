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

            <div className="container-padding text-white pt-[120px]">
                <FirstStep show={true} setFirstStepDone={setFirstStepDone} />
                <SecondStep show={firstStepDone} setSecondStepDone={setSecondStepDone} />
                <ThirdStep show={secondStepDone} selectedModels={selectedModels} setSelectedModels={setSelectedModels} />
                <ForthStep show={selectedModels.length > 0} selectedModels={selectedModels} />
            </div>
        </div>
    );
};
