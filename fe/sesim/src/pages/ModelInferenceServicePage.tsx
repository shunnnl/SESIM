import React, { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import PageBackground from "../assets/images/model-inference-service-bg.webp";
import { SnapScrollContainer } from "../components/common/SnapScrollContainer";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import BackgroundImage from "../assets/images/model-inference-service-content-bg.webp";
import { UserGuideSection } from "../components/ModelInferenceService/UserGuideSection";
import { ServiceDetailsSection } from "../components/ModelInferenceService/ServiceDetailsSection";

const getStepFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const step = parseInt(params.get("step") || "");
    if (step >= 1 && step <= 5) return step;
    return undefined;
}


export const ModelInferenceServicePage: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    // 사용자 가이드 영역 스크롤탑 버튼
    const guideRef = useRef<HTMLDivElement>(null);
    const [showGuideScrollTop, setShowGuideScrollTop] = useState(false);
    const [initialStep, setInitialStep] = useState<number | undefined>(undefined);

    useEffect(() => {
        setInitialStep(getStepFromQuery());
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!guideRef.current) return;
            const rect = guideRef.current.getBoundingClientRect();
            // guide 영역이 화면 상단에서 200px 이상 스크롤되면 버튼 표시
            setShowGuideScrollTop(rect.top < -200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleGuideScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <SnapScrollContainer>
            <PageTitleImageWithText
                title="SESIM 서비스 이용 안내"
                description1="고객의 데이터를 외부로 유출하지 않고, 개인 인프라 안에서"
                description2="AI 기반 보안 서비스를 사용할 수 있도록 프로젝트 환경을 자동으로 구축해 드립니다."
                buttonText="서비스 이용하기"
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
                ref={guideRef}
                className="text-white"
                style={{
                    background: "linear-gradient(to bottom, #000000 0px, #04101D 1000px, #04101D 100%)"
                }}
            >
                <h1 className="text-5xl font-bold text-center">사용자 가이드</h1>
                <UserGuideSection initialStep={initialStep} />
                {/* 사용자 가이드 ScrollToTopButton */}
                {showGuideScrollTop && (
                    <button
                        onClick={handleGuideScrollToTop}
                        className="fixed right-8 bottom-8 z-[999] bg-[#15305F] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-[#1e418a] transition-colors"
                        aria-label="가이드 맨 위로"
                    >
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 15l7-7 7 7"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </SnapScrollContainer>
    );
};