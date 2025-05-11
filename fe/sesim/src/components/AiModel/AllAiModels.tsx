import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { AiModelCard } from "./AiModelCard";
import backgroundImage from "../../assets/images/ai-model-list-bg.webp";

export const AllAiModels = () => {
    const { data } = useSelector((state: RootState) => state.aiModel);

    return (
        <div className="text-white bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <motion.div
                className="container-padding py-[100px] text-white"
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
            >
                <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold text-center">다양한 보안AI 모델을 찾아보세요</h1>
                <div className="relative w-full max-w-[1200px] mx-auto my-[88px]">
                    <div className="relative z-20 grid grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.map((model) => (
                            <AiModelCard key={model.id} {...model} />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
