import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BsCircleFill } from "react-icons/bs";
import infoIcon from "../assets/images/info.webp";
import { BlueCircle } from "../components/common/BlueCircle";
import { getAiModelDetail } from "../services/aiModelService";
import { AnimatedButton } from "../components/common/AnimatedButton";
import model1DetailImg1 from "../assets/images/model1-detail-img1.svg";
import model1DetailImg2 from "../assets/images/model1-detail-img2.svg";
import model1DetailImg3 from "../assets/images/model1-detail-img3.svg";
import { ExampleCodeBox } from "../components/AiModelDetail/ExampleCodeBox";
import { ImageTitleBannerWithNav } from "../components/AiModelDetail/ImageTitleBannerWithNav";

const model1DetailImgList = [
    model1DetailImg1,
    model1DetailImg2,
    model1DetailImg3,
]

export const AiModelDetailPage = () => {
    const { modelId } = useParams();
    const [selectedTab, setSelectedTab] = useState<"description" | "examplecode">("description");
    const [features, setFeatures] = useState<any[]>([]);
    const [modelName, setModelName] = useState<string>("");

    useEffect(() => {
        const fetchAiModelDetail = async () => {
            if (!modelId) return;
            const response = await getAiModelDetail(Number(modelId));
            setFeatures(response.data.features);
            setModelName(response.data.name);
        };
        fetchAiModelDetail();
    }, [modelId]);
    
    return (
        <div>
            <div className="relative z-10">
                <ImageTitleBannerWithNav
                    modelName={modelName}
                    description="웹 요청에서 해킹 시도와 이상 접근을 식별합니다."
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                />
            </div>
            <div className="container-padding my-[44px] text-white relative z-10">
                { selectedTab === "description" && (
                    <motion.div 
                        className="py-[44px]"
                        initial={{ opacity: 0, y: 70 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="flex flex-col items-center gap-[15px]">
                            <BlueCircle />
                            <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold">특징</h1>
                        </div>
                        <div>
                            <div className="mt-[2px]">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 70 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        viewport={{ once: true, amount: 0.2 }}
                                    >
                                        <h2
                                            className={`text-[80px] font-bold text-[#0075FF]/50 ${index % 2 === 1 ? "ml-[34%]" : ""}`}
                                        >
                                            0{index + 1}
                                        </h2>
                                        <div className={`flex gap-8 items-start w-full mb-10 ${index % 2 === 1 ? "flex-row-reverse" : ""}`}>
                                            <div className="flex flex-col gap-4 flex-[2] min-w-0 ml-[50px]">
                                                <div className="bg-gradient-to-l from-transparent to-[#367DF8] px-8 py-3 mb-2 rounded-[10px]">
                                                    <p className="text-[30px] font-bold">{feature.featureSummary}</p>
                                                </div>
                                                <p className="text-[20px] font-medium flex items-center gap-[10px]">
                                                    <BsCircleFill className="text-[#0075FF] w-[10px] h-[10px]" /> {feature.featureOverview}
                                                </p>
                                                <p className="text-[20px] font-medium flex items-center gap-[10px]">
                                                    <BsCircleFill className="text-[#0075FF] w-[10px] h-[10px]" /> {feature.featureDetail}
                                                </p>
                                            </div>
                                            <div className="flex-[1] flex items-center justify-center min-w-[1]">
                                                <img 
                                                    src={model1DetailImgList[index]}
                                                    alt="model1-detail-img1" 
                                                    className="w-[400px] h-[280px] object-contain rounded-xl shadow-lg"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                { selectedTab === "examplecode" && (
                    <motion.div 
                        className="flex justify-between gap-[50px] py-[44px]"
                        initial={{ opacity: 0, y: 70 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="flex flex-col gap-[10px]">
                            <div className="flex flex-col items-center">
                                <BlueCircle />
                                <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold">예시 코드</h1>
                            </div>
                            <div className="flex flex-col gap-[15px]">
                                <div>
                                    <p>사용자의 로그 데이터를 기반으로 학습시켜 개인 맞춤형 보안 탐지 모델로 활용할 수 있습니다.</p>
                                </div>
                                <div>
                                    <p>아래 예시 코드처럼 SESIM SDK를 이용해 모델을 학습시키면,</p>
                                    <p>여러분만의 환경에 최적화된 보안 AI가 완성 됩니다.</p>
                                </div>
                            </div>

                            <div className="mt-[80px]">
                                <p className="flex items-center gap-2 text-[15px] text-white mb-[20px]">
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
                                />
                            </div>
                        </div>
                        <ExampleCodeBox />
                    </motion.div>
                )}
            </div>

            { selectedTab == "description" && (
                <>
                    <motion.div
                        className="absolute top-[40%] right-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                        style={{
                            background: "#063584", 
                            boxShadow: "0 0 160px 120px #063584, 0 0 320px 240px #063584",
                            opacity: 0.4,
                            zIndex: 0
                        }}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    ></motion.div>
                    <motion.div
                        className="absolute top-[62%] left-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                        style={{
                            background: "#063584", 
                            boxShadow: "0 0 160px 120px #063584, 0 0 320px 240px #063584",
                            opacity: 0.4,
                            zIndex: 0
                        }}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    ></motion.div>
                    <motion.div
                        className="absolute top-[90%] right-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                        style={{
                            background: "#063584", 
                            boxShadow: "0 0 160px 120px #063584, 0 0 320px 240px #063584",
                            opacity: 0.4,
                            zIndex: 0
                        }}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    ></motion.div>
                </>
            )}

            { selectedTab == "examplecode" && (
                <motion.div
                    className="absolute top-[70%] left-[66%] -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                    style={{
                        background: "#063584", 
                        boxShadow: "0 0 160px 120px #063584, 0 0 320px 240px #063584",
                        opacity: 0.4,
                        zIndex: 0
                    }}
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 0.4, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                ></motion.div>
            )}
        </div>
    );
};