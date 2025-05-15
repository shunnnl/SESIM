import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserGuideCardProps {
    stepNumber: string;
    title: string;
    howToDescriptionLines: string[];
    userActionDescriptionLines: string[];
    imageSrc: string;
    imageAlt: string;
    imageSrc2?: string;
    imageAlt2?: string;
}

export const UserGuideCard: React.FC<UserGuideCardProps> = ({ stepNumber, title, howToDescriptionLines, userActionDescriptionLines, imageSrc, imageAlt, imageSrc2, imageAlt2 }) => {
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
        <div className="mt-[100px]">
            <h1 className="text-8xl font-semibold translate-x-8 translate-y-11 inline-block">{stepNumber}</h1>

            <div
                className="bg-[#04081D] rounded-[40px] px-[60px] py-[50px]"
                style={{ boxShadow: "0 0 50px 0 #74D0F4" }}
            >
                <h2 className="text-center text-4xl font-bold">{title}</h2>

                <div className="mt-[50px] flex flex-col gap-[10px] lg:flex-row justify-between">
                    <div className="flex-1">
                        <div>
                            <h3 className="text-2xl font-bold">어떻게 하면 되나요?</h3>
                            <div className="flex flex-row gap-[10px] mt-[15px]">
                                <div className="bg-[#722BF4] w-[6px] h-auto rounded-full"></div>
                                <div className="text-lg">
                                    {howToDescriptionLines.map((line, index) => (
                                        <p key={`how-to-${index}`}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-[30px] lg:mt-[50px]">
                            <h3 className="text-2xl font-bold">사용자가 해야할 일</h3>
                            <div className="flex flex-row gap-[10px] mt-[15px]">
                                <div className="bg-[#722BF4] w-[6px] h-auto rounded-full"></div>
                                <div className="text-lg">
                                    {userActionDescriptionLines.map((line, index) => (
                                        <p key={`user-action-${index}`}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-[50px] justify-center items-center mt-[30px] lg:mt-0">
                        <img
                            className="w-full max-w-[500px] h-auto object-contain rounded-md cursor-pointer"
                            src={imageSrc}
                            alt={imageAlt}
                            onClick={() => openModal(imageSrc)}
                        />
                        {imageSrc2 && (
                            <img
                                className="w-full max-w-[500px] h-auto object-contain rounded-md cursor-pointer"
                                src={imageSrc2}
                                alt={imageAlt2}
                                onClick={() => openModal(imageSrc2)}
                            />
                        )}
                    </div>
                </div>
            </div>

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