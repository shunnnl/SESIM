import { motion } from "framer-motion";
import { DetailButton } from "../components/Navbar/DetailButton";

const MainText = () => {
    return (
        <motion.p 
            className="text-5xl font-bold"
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            민감한 데이터를 지키는
            <br />
            가장 신뢰할 수 있는 AI 보안 솔루션
        </motion.p>
    )
}


const SubText = () => {
    return (
        <motion.p 
            className="text-xl font-medium"
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
            AI가 고객 인프라 내부에서 직접 작동하여
            <br />
            외부 유출 없이 보안 위협을 실시간으로 감지합니다.  
        </motion.p>
    )
}


const AnimatedDetailButton = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
        >
            <DetailButton />
        </motion.div>
    )
}


export const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col gap-[72px] text-white">
            <div className="flex flex-col gap-[24px] text-white mt-[200px]">
                <MainText />
                <SubText />
            </div>
            <div>
                <AnimatedDetailButton />
            </div>
        </div>
    );
};
