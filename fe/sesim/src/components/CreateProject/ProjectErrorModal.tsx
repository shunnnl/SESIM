import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectErrorModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    errorMessage?: string;
}

export const ProjectErrorModal: React.FC<ProjectErrorModalProps> = ({ isOpen, onConfirm, errorMessage = "프로젝트 생성에 실패했습니다" }) => {
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
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FF3838]/10 flex items-center justify-center">
                                <svg 
                                    className="w-10 h-10 text-[#FF3838]" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">프로젝트 생성 실패</h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-[#FF3838] to-[#FF6B6B] mx-auto rounded-full"></div>
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
                                className="bg-[#2C304B] p-5 rounded-xl border border-[#3C3D5C] hover:border-[#FF3838] transition-colors duration-300"
                            >
                                <p className="text-white text-xl font-medium">{errorMessage}</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-[#2C304B] p-5 rounded-xl border border-[#3C3D5C] hover:border-[#FF3838] transition-colors duration-300"
                            >
                                <p className="text-white text-lg">입력하신 정보를 확인하고 다시 시도해주세요</p>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex justify-center gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onConfirm}
                                className="bg-gradient-to-r from-[#FF3838] to-[#FF6B6B] text-white px-10 py-4 rounded-xl hover:from-[#FF6B6B] hover:to-[#FF3838] transition-all duration-300 font-medium text-lg shadow-lg shadow-[#FF3838]/20 hover:shadow-xl hover:shadow-[#FF3838]/30"
                            >
                                확인
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 