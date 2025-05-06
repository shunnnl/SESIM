import { motion } from "framer-motion";
import { AboutSesim } from "../components/About/AboutSesim";
import { SesimFunctions } from "../components/About/SesimFunctions";
import { ImageTitleBanner } from "../components/About/ImageTitleBanner";

export const AboutPage: React.FC = () => {
    return (
        <div className="relative">
            <ImageTitleBanner />

            <motion.div 
                className="container-padding text-white my-[88px] relative z-10"
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
                <AboutSesim />
            </motion.div>

            <motion.div
                className="container-padding text-white my-[88px] relative z-10"
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
            >
                <SesimFunctions />
            </motion.div>

            <div
                className="absolute top-1/2 left-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                style={{
                    background: "#00215A", 
                    boxShadow: "0 0 160px 120px #00215A, 0 0 320px 240px #00215A",
                    opacity: 0.4,
                    zIndex: 0
            }}
            ></div>
            <div
                className="absolute top-[90%] right-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                style={{
                    background: "#00215A", 
                    boxShadow: "0 0 160px 120px #00215A, 0 0 320px 240px #00215A",
                    opacity: 0.4,
                    zIndex: 0
            }}
            ></div>
        </div>
    );
};

