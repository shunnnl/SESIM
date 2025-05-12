import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import infoIcon from "../assets/images/info.webp";
import PageBackground from "../assets/images/sdk-download-bg.webp";
import { AnimatedButton } from "../components/common/AnimatedButton";
import BackgroundImage from "../assets/images/sdk-download-content-bg.webp";
import { ExampleCodeBox } from "../components/AiModelDetail/ExampleCodeBox";
import { SnapScrollContainer } from "../components/common/SnapScrollContainer";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";

export const SdkDownloadPage = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <SnapScrollContainer>
            <PageTitleImageWithText
                title="SDK 다운로드"
                description1="SeSeim 플랫폼의 주요 기능, API 사용법, SDK 연동 가이드, 모델 배포 절차"
                description2="등을 체계적으로 안내합니다."
                buttonText="SDK 다운로드"
                backgroundImage={PageBackground}
            />
            <div 
                ref={ref}
                className="bg-cover bg-center bg-no-repeat h-screen" 
                style={{ backgroundImage: `url(${BackgroundImage})` }}
            >
                <motion.div
                    className="flex justify-between gap-[50px] pt-[140px] container-padding text-white relative z-10"
                    initial={{ opacity: 0, y: 70 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 70 }}
                    transition={{ duration: 1, delay: 0, ease: "easeOut" }}
                >
                    <div className="flex flex-col gap-[10px]">
                        <motion.h1 
                            className="text-[24px] md:text-[32px] lg:text-[37px] font-bold"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            SDK 다운로드
                        </motion.h1>
                        <motion.div 
                            className="flex flex-col gap-[15px] text-[20px] mt-[40px]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        >
                            <div>
                                <p>고객 인프라 내에서 AI 보안 모델을 연동하기 위해 필요한 SESIM SDK를 다운로드 할 수 있습니다.</p>
                            </div>
                            <div>
                                <p>SDK는 다양한 운영환경에서 손쉽게 사용할 수 있도록 제공되며, 예시 코드를 함께 제공합니다.</p>
                            </div>
                        </motion.div>
                        <motion.div 
                            className="mt-[80px]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        >
                            <p className="flex items-center gap-2 text-[15px] mb-[20px]">
                                <img
                                    src={infoIcon}
                                    alt="info"
                                    className="w-[30px] h-[30px]"
                                />
                                <p className="text-[16px] font-bold">SESIM을 처음이용하신다면, SESIM SDK를 먼저 다운로드 하세요!</p>
                            </p>
                            <AnimatedButton
                                text="SESIM SDK 다운로드 하러 가기"
                                link="/"
                                width="370px"
                            />
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                    >
                        <ExampleCodeBox />
                    </motion.div>
                </motion.div>
                <motion.div
                    className="absolute top-[73%] left-[66%] -translate-y-1/2 w-[100px] h-[100px] rounded-full"
                    style={{
                        background: "#063584",
                        boxShadow: "0 0 160px 120px #063584, 0 0 320px 240px #063584",
                        opacity: 0.4,
                        zIndex: 0
                    }}
                    initial={{ opacity: 0, y: 100 }}
                    animate={isInView ? { opacity: 0.4, y: 0 } : { opacity: 0, y: 100 }}
                    transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                ></motion.div>
            </div>
        </SnapScrollContainer>
    );
};
