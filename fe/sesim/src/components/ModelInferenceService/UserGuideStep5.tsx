import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GuideNoticeAndFAQ } from "./GuideNoticeAndFAQ";
import Image1 from "../../assets/images/userguide-step5-1.webp";
import Image2 from "../../assets/images/userguide-step5-2.webp";

export const UserGuideStep5 = () => {
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
                            05
                        </span>
                        접근 허용 IP 등록 가이드
                    </h1>

                    <div className="mt-[80px]">
                        <h3 className="text-2xl font-bold">왜 필요한가요?</h3>
                        <div className="flex flex-row gap-[10px] mt-[15px]">
                            <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                            <div className="text-lg">
                                <p>보안 강화를 위해, Sesim은 배포된 프로젝트에 대해 지정된 IP만 접근을 허용합니다.</p>
                                <p>즉, 사전에 등록한 IP만이 해당 모델 인프라에 접속할 수 있습니다.</p>
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

            <div className="mt-[100px] flex items-start gap-[100px]">
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
                            <p>1. 접속을 허용할 IP를 입력하세요.</p>
                            <p className="text-[#C0C0C0]">* 개별 IP 입력: 192.168.0.1</p>
                            <p className="text-[#C0C0C0]">* CIDR 범위 입력: 192.168.0.0/24</p>
                        </div>
                    </div>

                    <div
                        className="mx-[130px] my-[10px] flex-shrink-0"
                        style={{
                            borderLeft: "4px dashed #B8B8B8",
                            height: "100%",
                            minHeight: "50px"
                        }}
                    />
                
                    <div className="flex flex-row gap-[10px] mt-[15px]">
                        <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                        <div className="text-lg">
                            <p>2. [IP 주소 등록] 버튼을 클릭해 리스트에 등록하세요.</p>
                        </div>
                    </div>
                </div>
            </div>

            <GuideNoticeAndFAQ
                noticeList={[
                    { text: "입력값은 IPv4 또는 CIDR 형식이어야 합니다." },
                    { text: "잘못된 형식은 저장되지 않습니다." }
                ]}
                faqList={[
                    { question: "내 IP가 뭔지 모르겠어요?", answer: "[내 IP 확인하기] 버튼을 클릭하면 현재 사용 중인 IP를 자동으로 확인할 수 있습니다." },
                    { question: "여러 개 입력 가능한가요?", answer: "네, 하나씩 추가적으로 등록 가능합니다." },
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
