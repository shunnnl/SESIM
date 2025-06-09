import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectStartModalProps {
    isOpen: boolean;
    onConfirm: () => void;
}

export const ProjectStartModal: React.FC<ProjectStartModalProps> = ({ isOpen, onConfirm }) => {
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
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#3893FF]/10 flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#3893FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">프로젝트 생성 시작</h2>
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
                                <p className="text-white text-xl font-medium">프로젝트 생성이 시작되었습니다.</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-[#2C304B] p-5 rounded-xl border border-[#3C3D5C] hover:border-[#3893FF] transition-colors duration-300"
                            >
                                <p className="text-white text-lg">프로젝트 생성에는 몇 분 정도 소요될 수 있습니다.</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-[#2C304B] p-5 rounded-xl border-2 border-[#3893FF] shadow-lg shadow-[#3893FF]/20"
                            >
                                <p className="text-[#3893FF] text-lg font-medium">
                                    키 정보 페이지에서 생성 진행 상황과 API 키를 확인하실 수 있습니다.
                                </p>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex justify-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onConfirm}
                                className="bg-gradient-to-r from-[#3893FF] to-[#2C7CD6] text-white px-10 py-4 rounded-xl hover:from-[#2C7CD6] hover:to-[#3893FF] transition-all duration-300 font-medium text-lg shadow-lg shadow-[#3893FF]/20 hover:shadow-xl hover:shadow-[#3893FF]/30"
                            >
                                키 정보 확인하기
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 