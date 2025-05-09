import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Model {
    id: number;
    name: string;
    path: string;
}

const models: Model[] = [
    { id: 1, name: 'Finect', path: '/ai-model/1' },
    { id: 2, name: 'SentimentX', path: '/ai-model/2' },
    { id: 3, name: 'ImageDetector', path: '/ai-model/3' },
    { id: 4, name: 'FraudGuard', path: '/ai-model/4' },
    { id: 5, name: 'TimeSeriesPredictor', path: '/ai-model/5' },
    { id: 6, name: 'RecommendX', path: '/ai-model/6' }
];

const linkClass = "text-white transition-colors duration-200 group-hover:font-bold font-medium transform transition-transform group-hover:scale-110";

export const ModelDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            
            <Link 
                to="/ai-model"
                className={linkClass}
            >
                AI모델
            </Link>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full -left-16 translate-x-1/2 mt-2 w-48 bg-[#242C4D] rounded-lg shadow-lg border border-[#3C3D5C] overflow-hidden"
                    >
                        {models.map((model) => (
                            <Link
                                key={model.id}
                                to={model.path}
                                className="text-[16px] block px-4 py-3 text-white hover:bg-[#3893FF] transition-colors duration-200"
                            >
                                {model.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}; 