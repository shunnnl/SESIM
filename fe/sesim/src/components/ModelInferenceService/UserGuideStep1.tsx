import { UserGuideCard } from './UserGuideCard';
import { GuideNoticeAndFAQ } from "./GuideNoticeAndFAQ";
import Image1 from "../../assets/images/userguide-step1-1.webp";
import Image2_01 from "../../assets/images/userguide-step1-2-01.webp";
import Image2_02 from "../../assets/images/userguide-step1-2-02.webp";
import Image2_03 from "../../assets/images/userguide-step1-2-03.webp";
import Image2_04 from "../../assets/images/userguide-step1-2-04.webp";
import Image2_05 from "../../assets/images/userguide-step1-2-05.webp";
import Image2_06 from "../../assets/images/userguide-step1-2-06.webp";
import Image2_07_1 from "../../assets/images/userguide-step1-2-07-1.webp";
import Image2_07_2 from "../../assets/images/userguide-step1-2-07-2.webp";

export const UserGuideStep1 = () => {
    return (
        <div className="mt-[100px]">
            <div className="flex flex-row gap-[100px]">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-[10px]">
                        <span className="text-[#9DC6FF] text-4xl">
                            01
                        </span>
                        IAM Role 연결 가이드
                    </h1>

                    <div className="mt-[80px]">
                        <h3 className="text-2xl font-bold">왜 필요한가요?</h3>
                        <div className="flex flex-row gap-[10px] mt-[15px]">
                            <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                            <div className="text-lg">
                                <p>Sesim 플랫폼은 사용자의 클라우드 환경에 AI 보안 모델을 안전하게 배포합니다.</p>
                                <p>이를 위해서는 <span className="text-[#9DC6FF] font-bold">AWS 리소스에 접근할 수 있는 권한(IAM Role)</span>이 필요합니다.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-[50px]">
                        <h3 className="text-2xl font-bold">어떻게 하면 되나요?</h3>
                        <div className="flex flex-row gap-[10px] mt-[15px]">
                            <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                            <div className="text-lg">
                                <p>IAM Role을 생성하고, 해당 역할의 ARN을 포털에 입력하면 연결이 완료됩니다.</p>
                                <p>아래 단계에 따라 <span className="text-[#9DC6FF] font-bold">CloudFormation 템플릿</span>을 실행하면 쉽게 설정할 수 있습니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    className="w-[400px] h-[400px]"
                    src={Image1}
                    alt="user-guide-step1-1"
                />
            </div>

            <UserGuideCard 
                stepNumber="01"
                title="CloudFormation 시작"
                howToDescriptionLines={[
                    "이 화면에서는 CloudFormation 템플릿을 선택하는 단계입니다.",
                    "템플릿 URL이 자동으로 입력되어 있으며,",
                    "이 템플릿을 통해 리소스를 배포할 수 있습니다."
                ]}
                userActionDescriptionLines={[
                    "입력된 템플릿 URL을 확인한 후, ",
                    "\"다음\" 버튼을 클릭하여 템플릿을 적용하고 진행합니다."
                ]}
                imageSrc={Image2_01}
                imageAlt="user-guide-step1-2-01"
            />

            <UserGuideCard
                stepNumber="02"
                title="스택 이름 입력"
                howToDescriptionLines={[
                    "이 화면에서는 스택 이름을 입력하는 단계입니다.",
                    "템플릿에 맞게 리소스를 생성하기 위해 스택을 설정합니다.",
                ]}
                userActionDescriptionLines={[
                    "스택 이름을 입력하고 \"다음\" 버튼을 클릭하여 진행합니다.",
                    "예: SESIM-AccessRole"
                ]}
                imageSrc={Image2_02}
                imageAlt="user-guide-step1-2-02"
            />

            <UserGuideCard
                stepNumber="03"
                title="리소스 생성 동의"
                howToDescriptionLines={[
                    "동의서에 체크하는 화면입니다.",
                    "템플릿을 통해 생성된 리소스에 대한 동의를 묻는 단계입니다.",
                ]}
                userActionDescriptionLines={[
                    "동의 체크박스를 클릭하고 \"다음\" 버튼을 클릭하여 진행합니다.",
                ]}
                imageSrc={Image2_03}
                imageAlt="user-guide-step1-2-03"
            />

            <UserGuideCard
                stepNumber="04"
                title="스택 생성 시작"
                howToDescriptionLines={[
                    "최종적으로 설정을 확인하고 리소스 생성이 진행되는 화면입니다.",
                ]}
                userActionDescriptionLines={[
                    "설정을 확인하고 \"다음\" 버튼을 클릭하여 리소스 생성을 완료합니다.",
                ]}
                imageSrc={Image2_04}
                imageAlt="user-guide-step1-2-04"
            />

            <UserGuideCard
                stepNumber="05"
                title="생성된 리소스 확인"
                howToDescriptionLines={[
                    "이 화면은 리소스 생성이 완료된 후 나타나는 화면입니다.",
                    "템플릿을 적용하여 생성된 IAM 역할 및 리소스들에 대한 정보를",
                    "확인할 수 있습니다."
                ]}
                userActionDescriptionLines={[
                    "생성된 리소스를 확인하고 \"리소스 클릭\"을 통해",
                    "세부 정보를 살펴볼 수 있습니다."
                ]}
                imageSrc={Image2_05}
                imageAlt="user-guide-step1-2-05"
            />

            <UserGuideCard
                stepNumber="06"
                title="세부 정보 보기"
                howToDescriptionLines={[
                    "생성된 리소스의 세부 정보를 확인하는 화면입니다.",
                    "여기서는 물리적 ID를 확인할 수 있습니다.",
                ]}
                userActionDescriptionLines={[
                    "생성된 리소스를 클릭하고, 물리적 ID를 확인한 후,",
                    "해당 정보를 복사할 수 있습니다."
                ]}
                imageSrc={Image2_06}
                imageAlt="user-guide-step1-2-06"
            />


            <UserGuideCard
                stepNumber="07"
                title="ARN 복사 및 SaaS 포털에 입력"
                howToDescriptionLines={[
                    "IAM 역할의 ARN (고유 식별자)을 확인하는 화면입니다.",
                    "이 ARN을 사용하여 역할을 검증하고,",
                    "SaaS 포털에서 사용할 수 있습니다."
                ]}
                userActionDescriptionLines={[
                    "화면에서 ARN을 복사하여 SaaS 포털에 입력하고,",
                    "검증을 받습니다."
                ]}
                imageSrc={Image2_07_1}
                imageAlt="user-guide-step1-2-07-1"
                imageSrc2={Image2_07_2}
                imageAlt2="user-guide-step1-2-07-2"
            />

            <GuideNoticeAndFAQ
                noticeList={[
                    { text: "CloudFormation 템플릿을 임의로 수정하지 마세요." },
                    { text: "ARN 복사 시, 공백이나 오타가 없도록 주의하세요." }
                ]}
                faqList={[
                    { question: "ARN이 뭔가요?", answer: "AWS 리소스를 고유하게 식별하는 문자열로, 포털에서 연결을 위해 반드시 필요합니다." },
                    { question: "연결 후 변경이 가능한가요?", answer: "새로운 IAM Role을 다시 생성한 후 ARN을 갱신하면 재연결할 수 있습니다." }
                ]}
            />
        </div>
    );
};
