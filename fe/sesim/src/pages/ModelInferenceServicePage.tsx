import { BlueCircle } from "../components/common/BlueCircle";
import { AnimatedButton } from "../components/common/AnimatedButton";
import { AiImage } from "../components/ModelInferenceService/AiImage";
import PageBackground from "../assets/images/model-inference-service-bg.png";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import { ServiceDescriptionList } from "../components/ModelInferenceService/ServiceDescriptionList";

export const ModelInferenceServicePage: React.FC = () => {
    return (
        <div>
            <PageTitleImageWithText
                title="모델 추론 서비스"
                description1="프로젝트를 생성해"
                description2="AI 모델을 선택하고, 내 인프라에 자동 배포하세요."
                backgroundImage={PageBackground}
            />

            <div className="container-padding w-full text-white py-[88px]">
                <div className="flex flex-col items-center gap-[15px]">
                    <BlueCircle />
                    <h1 className="text-[37px] font-bold">모델 추론 서비스</h1>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-[60px] mt-[40px]">
                    {/* 왼쪽: 설명 및 버튼 */}
                    <div className="flex flex-col gap-[30px]">
                        <p className="text-[22px] font-normal">
                            SESIM이 제공하는 다양한 보안 AI 모델 중 원하는 모델을 선택하고,
                            <br />
                            VPC(개인망)에 안전하게 설치할 수 있습니다.
                        </p>
                        <div className="flex flex-col gap-[15px]">
                            <ServiceDescriptionList
                                title="모델 선택"
                                description="이상행위 탐지, 계정 도용 방지 등 다양한 보안 AI 모델을 제공합니다."
                            />
                            <ServiceDescriptionList
                                title="배포 환경 구성"
                                description="모델을 설치할 서버 사양을 직접 지정할 수 있습니다."
                            />
                            <ServiceDescriptionList
                                title="IAM Role 기반 배포"
                                description="사용자가 제공한 IAM Role 정보를 통해 사내 클라우드 환경에 안전하게 접근합니다."
                            />
                            <ServiceDescriptionList
                                title="실시간 모니터링 및 대시보드"
                                description="AI 모델이 탐지한 이상 행위 결과는 Grafana 대시보드를 통해 실시간 시각화됩니다."
                            />
                        </div>
                        <AnimatedButton
                            text="프로젝트 생성하기" 
                            link="/model-inference-service" 
                            width="250px"
                        />
                    </div>
                    {/* 오른쪽: 이미지 */}
                    <AiImage />
                </div>
            </div>
        </div>
    );
};