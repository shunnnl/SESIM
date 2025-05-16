import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image1 from "../../assets/images/architecture-1.webp";
import Image2 from "../../assets/images/architecture-2.webp";
import Image3 from "../../assets/images/architecture-3.webp";

export const SesimArchitecture = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    const openModal = (src: string) => {
        setModalImageSrc(src);
        setIsModalOpen(true);
    };


    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageSrc('');
    };

    // 모달 상태에 따라 body 스크롤 제어
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // 컴포넌트 언마운트 시 스크롤 복원
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    return (
        <div>
            <h2 className="text-4xl font-bold text-center">안정성과 보안을 모두 갖춘 SESIM 인프라 아키텍처</h2>

            <div className="flex flex-row justify-center items-center gap-[50px] mt-[120px]">
                <div className="">
                    <h3 className="text-2xl font-bold">고가용성 이중화 구성</h3>
                    <div className="flex flex-row gap-[10px] mt-[15px]">
                        <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                        <div className="text-lg">
                            <p>SESIM은 프론트엔드와 백엔드 서버의 이중화 구성으로 </p>
                            <p>서비스 중단 없는 운영 환경을 보장합니다.</p>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-[#04081D] rounded-[40px] w-fit px-[60px] py-[50px]"
                    style={{ boxShadow: "0 0 50px 0 #74D0F4" }}
                >
                    <img
                        className="w-[400px] h-full rounded-[20px] cursor-pointer"
                        src={Image1}
                        alt="user-guide-step2-1"
                        onClick={() => openModal(Image1)}
                    />
                </div>
            </div>

            <div className="flex flex-row justify-center items-center gap-[50px] mt-[100px]">
                <div
                    className="bg-[#04081D] rounded-[40px] w-fit px-[50px] py-[50px]"
                    style={{ boxShadow: "0 0 50px 0 #74D0F4" }}
                >
                    <img
                        className="w-[300px] h-full rounded-[20px] cursor-pointer"
                        src={Image2}
                        alt="user-guide-step2-1"
                        onClick={() => openModal(Image2)}
                    />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">고객 전용 프라이빗 VPC 제공</h3>
                    <div className="flex flex-row gap-[10px] mt-[15px]">
                        <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                        <div className="text-lg">
                            <p>고객의 인프라 환경(K3S)을 별도 VPC로 분리하여, </p>
                            <p>데이터가 외부로 유출되지 않는 프라이빗 AI 배포 환경을 제공합니다.</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-center mt-[150px]">보안성과 확장성을 모두 고려한 구조로, 금융·공공기관 등 고신뢰 환경에 최적화된 SaaS 보안 플랫폼입니다.</h2>

            <img
                src={Image3}
                alt="ArchitectureImage1"
                className="w-[1000px] h-full rounded-[20px] mx-auto mt-[50px] cursor-pointer"
                onClick={() => openModal(Image3)}
            />
            
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-8"
                        onClick={closeModal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.img
                            src={modalImageSrc}
                            alt="Enlarged guide"
                            className="block max-w-[80vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                        <button
                            onClick={closeModal}
                            className="absolute top-5 right-5 text-white text-6xl font-bold hover:text-gray-300 transition-colors"
                        >
                            &times;
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
