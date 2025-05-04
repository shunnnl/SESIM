import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import backgroundImage from "../assets/images/create-project-bg.png";
import { FirstStep } from "../components/CreateProject/FirstStep";
import { SecondStep } from "../components/CreateProject/SecondStep";
export const CreateProjectPage = () => {
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
                {/* <ThirdStep /> */}
                {/* <FourthStep /> */}
            </div>
        </div>
    );
};
