import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import backgroundImage from "../assets/images/create-project-bg.png";
import { FormStepHeader } from "../components/CreateProject/FormStepHeader";
import { BigCard } from "../components/CreateProject/BigCard";
import cloudFormationIcon from "../assets/images/aws-cloudformation.png";

export const CreateProjectPage = () => {
    return (
        <div>
            <PageTitleImageWithText
                title="프로젝트 생성"
                description1="개인 맞춤형 AI 보안 프로젝트 생성"
                description2=""
                backgroundImage={backgroundImage}
            />

            <div className="container-padding text-white py-[84px]">
                <FormStepHeader
                    step="01"
                    title="IAM Role 연결" 
                    description="SaaS 포털이 고객 AWS에 접근하려면 IAM Role 연결이 필요합니다."
                    must={true}
                />
                <div className="mt-[15px]">
                    <BigCard>
                        <div>
                            <p className="text-[16px] font-normal text-[#979797]">* CloudFormation 템플릿을 통해 손쉽게 Role을 생성할 수 있습니다.</p>
                            <button className="mt-[10px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] p-[10px] flex flex-row items-center gap-[10px]">
                                <img src={cloudFormationIcon} alt="cloudFormationIcon" className="w-[25px] h-[30px]" />
                                <p className="text-[20px] font-bold">CloudFormation</p>
                            </button>
                        </div>
                        <div>
                            <p className="text-[16px] font-normal text-[#979797]">* 기존에 발급한 ARN이 있다면 아래에서 확인해 선택해 주세요.</p>
                            
                        </div>

                        <p className="text-[16px] font-normal text-[#979797]">* 검증할 IAM Role의 ARN을 입력하고 Assume Role 권한을 확인합니다.</p>
                    </BigCard>
                </div>
            </div>
        </div>
    );
};
