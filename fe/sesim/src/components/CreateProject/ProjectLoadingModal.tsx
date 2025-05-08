import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectLoadingModalProps {
    isOpen: boolean;
}

export const ProjectLoadingModal: React.FC<ProjectLoadingModalProps> = ({ isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ 
                            type: "spring",
                            duration: 0.5,
                            bounce: 0.3
                        }}
                        className="bg-[#242C4D] p-10 rounded-2xl shadow-2xl max-w-md w-full border border-[#3C3D5C]"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">프로젝트 생성 중</h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-[#3893FF] to-[#2C7CD6] mx-auto rounded-full"></div>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-5 mb-10"
                        >
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-[#2C304B] p-5 rounded-xl border border-[#3C3D5C] hover:border-[#3893FF] transition-colors duration-300"
                            >
                                <p className="text-white text-xl font-medium">프로젝트 생성 요청이 진행중입니다</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-[#2C304B] p-5 rounded-xl border border-[#3C3D5C] hover:border-[#3893FF] transition-colors duration-300"
                            >
                                <p className="text-white text-lg">잠시만 기다려주세요...</p>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex justify-center"
                        >
                            <div className="w-12 h-12 border-4 border-[#3893FF] border-t-transparent rounded-full animate-spin"></div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 