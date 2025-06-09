import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GuideNoticeAndFAQ } from "./GuideNoticeAndFAQ";
import Image1 from "../../assets/images/userguide-step2-1.webp";
import Image2 from "../../assets/images/userguide-step2-2.webp";

export const UserGuideStep2 = () => {
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
        <div className="mt-[300px]">
            <div className="flex flex-row gap-[100px]">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-[10px]">
                        <span className="text-[#9DC6FF] text-4xl">
                            02
                        </span>
                        프로젝트 기본 정보 입력 가이드
                    </h1>

                    <div className="mt-[80px]">
                        <h3 className="text-2xl font-bold">왜 필요한가요?</h3>
                        <div className="flex flex-row gap-[10px] mt-[15px]">
                            <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                            <div className="text-lg">
                                <p>Sesim에서는 프로젝트 단위로 보안 AI 모델을 배포합니다.</p>
                                <p>각 프로젝트를 식별하고 관리할 수 있도록 이름과 설명을 작성해야 합니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    className="w-[400px] h-full"
                    src={Image1}
                    alt="user-guide-step1-1"
                />
            </div>

            <div className="mt-[100px] flex items-center gap-[100px]">
                <div
                    className="bg-[#04081D] rounded-[40px] w-fit px-[60px] py-[50px]"
                    style={{ boxShadow: "0 0 50px 0 #74D0F4" }}
                >
                    <img
                        className="w-[400px] h-full rounded-[40px] cursor-pointer"
                        src={Image2}
                        alt="user-guide-step2-1"
                        onClick={() => openModal(Image2)}
                    />
                </div>

                <div>
                    <h3 className="text-2xl font-bold">어떻게 하면 되나요?</h3>
                    <div className="flex flex-row gap-[10px] mt-[15px]">
                        <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                        <div className="text-lg">
                            <p>1. 프로젝트 이름을 입력하세요.</p>
                            <p className="text-[#C0C0C0]">예: “우리회사 내부망 분석용 프로젝트”</p>
                        </div>
                    </div>

                    <div
                        className="mx-[130px] my-[10px] flex-shrink-0"
                        style={{
                            borderLeft: "4px dashed #B8B8B8",
                            height: "100%",
                            minHeight: "100px"
                        }}
                    />
                
                    <div className="flex flex-row gap-[10px] mt-[15px]">
                        <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                        <div className="text-lg">
                            <p>2. 프로젝트 설명을 작성하세요.</p>
                            <p className="text-[#C0C0C0]">어떤 데이터를 분석할지, 어떤 AI 모델을 사용할지 간단히 적어주세요.</p>
                            <p className="text-[#C0C0C0]">예: “내부 사용자 로그인 패턴 분석을 위한 AI 모델 실험용”</p>
                        </div>
                    </div>
                </div>
            </div>

            <GuideNoticeAndFAQ
                noticeList={[
                    { text: "프로젝트 이름은 100자 내외" },
                    { text: "프로젝트 설명은 500자 이하" }
                ]}
                faqList={[
                    { question: "프로젝트 이름을 나중에 바꿀수 있나요?", answer: "아니요! 프로젝트 이름 / 설명은 추후에 변경이 불가능합니다." },
                ]}
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
