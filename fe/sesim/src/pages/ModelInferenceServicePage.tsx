import React, { useRef } from "react";
import { useInView } from "framer-motion";
import PageBackground from "../assets/images/model-inference-service-bg.webp";
import { SnapScrollContainer } from "../components/common/SnapScrollContainer";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import BackgroundImage from "../assets/images/model-inference-service-content-bg.webp";
import { UserGuideSection } from "../components/ModelInferenceService/UserGuideSection";
import { ServiceDetailsSection } from "../components/ModelInferenceService/ServiceDetailsSection";

export const ModelInferenceServicePage: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <SnapScrollContainer>
            <PageTitleImageWithText
                title="SESIM 서비스 이용 안내"
                description1="고객의 데이터를 외부로 유출하지 않고, 개인 인프라 안에서"
                description2="AI 기반 보안 서비스를 사용할 수 있도록 프로젝트 환경을 자동으로 구축해 드립니다."
                buttonText="프로젝트 생성하기"
                backgroundImage={PageBackground}
            />
            <div
                ref={ref}
                className="bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center"
                style={{ backgroundImage: `url(${BackgroundImage})` }}
            >
                <ServiceDetailsSection isInView={isInView} />
            </div>

            <div
                className="text-white container-padding"
                style={{
                    background: "linear-gradient(to bottom, #000000 0px, #04101D 1000px, #04101D 100%)"
                }}
            >
                <h1 className="text-5xl font-bold text-center">사용자 가이드</h1>
                <UserGuideSection />
            </div>
        </SnapScrollContainer>
    );
};