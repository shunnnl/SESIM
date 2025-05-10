import { motion } from "framer-motion";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { LoginModal } from "../components/Popup/LoginModal";
import { BlueCircle } from "../components/common/BlueCircle";
import { SignUpModal } from "../components/Popup/SignUpModal";
import { AnimatedButton } from "../components/common/AnimatedButton";
import { AiImage } from "../components/ModelInferenceService/AiImage";
import PageBackground from "../assets/images/model-inference-service-bg.webp";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import { ServiceDescriptionList } from "../components/ModelInferenceService/ServiceDescriptionList";

export const ModelInferenceServicePage: React.FC = () => {
    const navigate = useNavigate();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const handleSignUpClick = () => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
    };


    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
        setIsSignUpModalOpen(false);
    };


    const handleCreateProject = () => {
        if (isLoggedIn) {
            navigate("/model-inference-service/create-project");
        } else {
            setIsLoginModalOpen(true);
        }
    };

    return (
        <div>
            <PageTitleImageWithText
                title="모델 추론 서비스"
                description1="프로젝트를 생성해"
                description2="AI 모델을 선택하고, 내 인프라에 자동 배포하세요."
                backgroundImage={PageBackground}
            />

            <motion.div
                className="container-padding w-full text-white py-[44px]"
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <motion.div
                    className="flex flex-col items-center gap-[15px]"
                    initial={{ opacity: 0, y: 70 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                >
                    <BlueCircle />
                    <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold">모델 추론 서비스</h1>
                </motion.div>

                <motion.div
                    className="flex flex-col md:flex-row justify-center items-center gap-[30px] md:gap-[60px] mt-[20px] md:mt-[40px]"
                    initial={{ opacity: 0, y: 70 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                >
                    {/* 왼쪽: 설명 및 버튼 */}
                    <motion.div
                        className="flex flex-col gap-[15px] md:gap-[30px]"
                        initial={{ opacity: 0, x: -70 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    >
                        <p className="text-[18px] md:text-[20px] lg:text-[22px] font-normal">
                            SESIM이 제공하는 다양한 보안 AI 모델 중 원하는 모델을 선택하고,
                            <br />
                            VPC(개인망)에 안전하게 설치할 수 있습니다.
                        </p>
                        <motion.div
                            className="flex flex-col gap-[10px] md:gap-[15px]"
                            initial={{ opacity: 0, y: 70 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                        >
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
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 70 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                        >
                            <AnimatedButton
                                text="프로젝트 생성하기"
                                link=""
                                width="250px"
                                onClick={handleCreateProject}
                            />
                        </motion.div>
                    </motion.div>
                    {/* 오른쪽: 이미지 */}
                    <motion.div
                        initial={{ opacity: 0, x: 70 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    >
                        <AiImage />
                    </motion.div>
                </motion.div>
            </motion.div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToSignUp={handleSignUpClick}
            />

            <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onSwitchToLogin={handleLoginClick}
            />
        </div>
    );
};