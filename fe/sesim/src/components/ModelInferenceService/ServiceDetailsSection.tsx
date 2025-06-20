import React from "react";
import { AiImage } from "./AiImage";
import { motion } from "framer-motion";
import { ServiceDescriptionList } from "./ServiceDescriptionList";

interface ServiceDetailsSectionProps {
    isInView: boolean;
}

export const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({ isInView }) => {
    return (
        <motion.div
            className="container-padding w-full text-white py-[120px]"
            initial={{ opacity: 0, y: 70 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 70 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            <motion.div
                className="flex flex-col items-center gap-[3px]"
                initial={{ opacity: 0, y: 70 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 70 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
                <h1 className="text-2xl lg:text-4xl font-bold">다양한 보안 AI 모델 중 원하는 모델을 선택하고,</h1>
                <h1 className="text-2xl lg:text-4xl font-bold">자신의 VPC에 <span className="text-[#9DC6FF]">안전</span>하게 설치할 수 있습니다.</h1>
            </motion.div>

            <motion.div
                className="flex flex-col md:flex-row justify-center items-center gap-[20px] md:gap-[40px] mt-[20px] md:mt-[40px]"
                initial={{ opacity: 0, y: 70 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 70 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
                {/* 왼쪽: 이미지 */}
                <motion.div
                    initial={{ opacity: 0, x: 70 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 70 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                >
                    <AiImage />
                </motion.div>
                {/* 오른쪽: 설명 및 버튼 */}
                <motion.div
                    className="flex flex-col gap-[15px] md:gap-[30px]"
                    initial={{ opacity: 0, x: -70 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -70 }}
                    transition={{ duration: 1, delay: 1, ease: "easeOut" }}
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
            </motion.div>
        </motion.div>
    );
}; 