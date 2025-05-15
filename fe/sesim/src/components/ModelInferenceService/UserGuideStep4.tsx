import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GuideNoticeAndFAQ } from "./GuideNoticeAndFAQ";
import Image1 from "../../assets/images/userguide-step4-1.webp";
import Image2 from "../../assets/images/userguide-step4-2.webp";

export const UserGuideStep4 = () => {
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
                            04
                        </span>
                        서버 사양 선택 가이드
                    </h1>

                    <div className="mt-[80px]">
                        <h3 className="text-2xl font-bold">왜 필요한가요?</h3>
                        <div className="flex flex-row gap-[10px] mt-[15px]">
                            <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                            <div className="text-lg">
                                <p>선택한 AI 모델은 각기 다른 자원(CPU, GPU, INF2)을 필요로 합니다.</p>
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
                            <p>1. AI 모델 선택</p>
                            <p className="text-[#C0C0C0]">STEP 03에서 선택한 모델이 이 단계에 자동으로 표시됩니다.</p>
                            <p className="text-[#C0C0C0]">다중 모델을 선택한 경우, 각 모델별로 사양 설정이 필요합니다.</p>
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
                            <p>2. 서버 제공업체 선택</p>
                            <p className="text-[#C0C0C0]">현재는 Amazon Web Services (AWS)만 지원됩니다.</p>
                            <p className="text-[#C0C0C0]">Microsoft Azure, Google Cloud Platform은 추후 지원 예정입니다.</p>
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
                            <p>3. 리전(국가) 선택</p>
                            <p className="text-[#C0C0C0]">서버가 실제로 생성될 국가를 선택하세요.</p>
                            <p className="text-[#C0C0C0]">예 : Asia Pacific (Seoul),  US East (N. Virginia) 등...</p>
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
                            <p>4. 서버 타입 선택</p>
                            <p className="text-[#C0C0C0]">각 모델에 대해 CPU / GPU / INF2 타입 중 하나를 선택하세요.</p>
                            <p className="text-[#C0C0C0]">* CPU 기반: 비용 효율적, 일반 작업</p>
                            <p className="text-[#C0C0C0]">* GPU 기반: 고성능 병렬 연산</p>
                            <p className="text-[#C0C0C0]">* INF2: 대규모 AI 모델 추론 전용 (AWS Inferentia 기반)</p>
                        </div>
                    </div>

                    
                </div>
            </div>

            <GuideNoticeAndFAQ
                noticeList={[
                    { text: "선택한 사양은 프로젝트 생성 후 변경이 불가능합니다." },
                    { text: "과금은 선택한 사양, 사용 시간, 모델에 따라 달라집니다." }
                ]}
                faqList={[
                    { question: "모델마다 서버를 따로 선택해야 하나요?", answer: "네, 복수의 AI 모델을 선택한 경우 각각의 모델에 맞는 사양을 지정해야 합니다." },
                    { question: "리전을 잘못 선택하면 문제가 생기나요?", answer: "같은 국가의 리전을 선택하는 것이 지연 속도 및 데이터 정책에 유리합니다." },
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
