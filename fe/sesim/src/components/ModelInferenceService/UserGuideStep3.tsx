import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "../../assets/images/userguide-step3.webp"
import { GuideNoticeAndFAQ } from "./GuideNoticeAndFAQ";

export const UserGuideStep3 = () => {
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
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-[10px]">
                    <span className="text-[#9DC6FF] text-4xl">
                        03
                    </span>
                    보안 AI 모델 선택 가이드
                </h1>

                <div className="mt-[80px] flex flex-row gap-[100px]">
                    <div>
                        <h3 className="text-2xl font-bold">왜 필요한가요?</h3>
                        <div className="flex flex-row gap-[10px] mt-[15px]">
                            <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                            <div className="text-lg">
                                <p>각 AI 모델은 탐지하는 보안 위협 유형이 다릅니다.</p>
                                <p>업무에 맞는 모델을 선택해야 가장 효과적으로 보안 위험을 감지할 수 있습니다.</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">어떻게 하면 되나요?</h3>
                        <div className="flex flex-row gap-[10px] mt-[15px]">
                            <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                            <div className="text-lg">
                                <p>모델 리스트에서 원하는 AI 모델을 선택하세요.</p>
                                <p>각 모델에는 사용 목적이 간단히 표시되어 있습니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-[#04081D] rounded-[40px] w-fit mt-[100px] px-[60px] py-[50px]"
                    style={{ boxShadow: "0 0 50px 0 #74D0F4" }}
                >
                    <img
                        className="w-[400px] h-full rounded-[40px] cursor-pointer"
                        src={Image}
                        alt="user-guide-step3-1"
                        onClick={() => openModal(Image)}
                    />
                </div>


            </div>

            <GuideNoticeAndFAQ
                noticeList={[
                    { text: "선택한 모델에 따라 이후 STEP 04 에서 선택 가능한 서버 사양과 금액이 달라집니다." }
                ]}
                faqList={[
                    { question: "여러개의 모델을 동시에 선택할 수 있나요?", answer: "네, 프로젝트당 여러개의 모델을 동시에 선택할수 있습니다." },
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
