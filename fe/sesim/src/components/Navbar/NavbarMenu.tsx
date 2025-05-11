import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
const menuClass = "relative group px-2 flex flex-col items-center justify-center min-w-[65px]";
const linkClass = "text-white transition-colors duration-200 group-hover:font-bold font-medium transform transition-transform group-hover:scale-110";
const indicatorClass = "absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3893FF] opacity-0 group-hover:opacity-100 transition-opacity duration-200";

interface Model {
    id: number;
    name: string;
    path: string;
}

const models: Model[] = [
    { id: 1, name: "Finect", path: "/ai-model/1" },
    { id: 2, name: "SentimentX", path: "/ai-model/2" },
    { id: 3, name: "ImageDetector", path: "/ai-model/3" },
    { id: 4, name: "FraudGuard", path: "/ai-model/4" },
    { id: 5, name: "TimeSeriesPredictor", path: "/ai-model/5" },
    { id: 6, name: "RecommendX", path: "/ai-model/6" }
];

export const NavbarMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="z-20 nav-menu flex flex-row flex-nowrap items-center justify-center text-center gap-3 md:gap-1 lg:gap-8 xl:gap-[60px] text-[15px] md:text-[17px] lg:text-[18px] text-white pl-6">
            <div className={`${menuClass} whitespace-nowrap`}>
                <Link
                    to="/about"
                    className={linkClass}
                >
                    소개
                </Link>
                <div className={indicatorClass}></div>
            </div>
            <div
                className={`${menuClass} whitespace-nowrap`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <Link 
                    to="/ai-model"
                    className={linkClass}
                >
                    AI모델
                </Link>
                <div className={indicatorClass}></div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute -left-16 translate-x-1/2 top-1/2 translate-y-1/2"
                    >
                        <div className="mt-[60px] w-48 bg-[#07142B] rounded-[20px] shadow-[0px_0px_15px_rgba(116,208,244,0.4)] border border-[#3C3D5C] overflow-hidden">
                            {models.map((model) => (
                                <Link
                                    key={model.id}
                                    to={model.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-[16px] block px-4 py-3 text-white hover:bg-[#3893FF] transition-colors duration-200"
                                >
                                    {model.name}
                                </Link>
                            ))}
                        </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className={`${menuClass} whitespace-nowrap`}>
                <Link
                    to="/model-inference-service"
                    className={linkClass}
                >
                    모델추론 서비스
                </Link>
                <div className={indicatorClass}></div>
            </div>
            <div className={`${menuClass} whitespace-nowrap`}>
                <Link
                    to="/sdk-download"
                    className={linkClass}
                >
                    SDK 다운로드
                </Link>
                <div className={indicatorClass}></div>
            </div>
        </div>
    );
};