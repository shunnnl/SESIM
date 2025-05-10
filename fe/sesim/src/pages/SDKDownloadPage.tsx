import { motion } from "framer-motion";
import infoIcon from "../assets/images/info.webp";
import { BlueCircle } from "../components/common/BlueCircle";
import PageBackground from "../assets/images/sdk-download-bg.webp";
import { AnimatedButton } from "../components/common/AnimatedButton";
import { ExampleCodeBox } from "../components/AiModelDetail/ExampleCodeBox";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";

export const SdkDownloadPage = () => {
    return (
        <div>
            <PageTitleImageWithText
                title="SDK 다운로드"
                description1="SESIM SDK를 다운로드하고 고객 인프라에 AI 보안 모델을 쉽게 연동하세요."
                description2=""
                backgroundImage={PageBackground}
            />
            <motion.div 
                className="flex justify-between gap-[50px] py-[88px] container-padding  text-white"
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
                <div className="flex flex-col gap-[10px]">
                    <div className="flex flex-col items-center">
                        <BlueCircle />
                        <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold">SDK 다운로드</h1>
                    </div>
                    <div className="flex flex-col gap-[15px] text-[20px] mt-[40px]">
                        <div>
                            <p>고객 인프라 내에서 AI 보안 모델을 연동하기 위해 필요한 SESIM SDK를 다운로드 할 수 있습니다.</p>
                        </div>
                        <div>
                            <p>SDK는 다양한 운영환경에서 손쉽게 사용할 수 있도록 제공되며, 예시 코드를 함께 제공합니다.</p>
                        </div>
                    </div>

                    <div className="mt-[80px]">
                        <p className="flex items-center gap-2 text-[15px] mb-[20px]">
                            <img 
                                src={infoIcon} 
                                alt="info" 
                                className=" w-[30px] h-[30px]" 
                            />
                            <p className="text-[16px] font-bold">SESIM을 처음이용하신다면, SESIM SDK를 먼저 다운로드 하세요!</p>
                        </p>
                        
                        <AnimatedButton
                            text="SESIM SDK 다운로드 하러 가기" 
                            link="/" 
                            width="370px" 
                            onClick={() => window.scrollTo(0,0)}
                        />
                    </div>
                </div>

                <ExampleCodeBox />
            </motion.div>
        </div>
    );
};
