import { FirstStep } from "../components/CreateProject/FirstStep";
import { ThirdStep } from "../components/CreateProject/ThirdStep";
import { ForthStep } from "../components/CreateProject/ForthStep";
import { SecondStep } from "../components/CreateProject/SecondStep";
import backgroundImage from "../assets/images/create-project-bg.png";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import { useState } from "react";

export const CreateProjectPage = () => {
    const [selectedModels, setSelectedModels] = useState<string[]>([]);

    return (
        <div>
            <PageTitleImageWithText
                title="프로젝트 생성"
                description1="개인 맞춤형 AI 보안 프로젝트 생성"
                description2=""
                backgroundImage={backgroundImage}
            />

            <div className="container-padding text-white py-[120px]">
                <FirstStep />
                <SecondStep />
                <ThirdStep selectedModels={selectedModels} setSelectedModels={setSelectedModels} />
                <ForthStep selectedModels={selectedModels} />
            </div>
        </div>
    );
};
