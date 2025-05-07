import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import infoIcon from "../assets/images/info.png";
import { BlueCircle } from "../components/common/BlueCircle";
import { AnimatedButton } from "../components/common/AnimatedButton";
import { ExampleCodeBox } from "../components/AiModelDetail/ExampleCodeBox";
import { ImageTitleBannerWithNav } from "../components/AiModelDetail/ImageTitleBannerWithNav";
import { getAiModelDetail } from "../services/aiModelService";

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
            <ImageTitleBannerWithNav
                modelName={modelName}
                description="웹 요청에서 해킹 시도와 이상 접근을 식별합니다."
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />
            <div className="container-padding my-[44px] text-white">
                { selectedTab === "description" && (
                    <motion.div 
                        className="flex flex-col items-center gap-[15px] py-[44px]"
                        initial={{ opacity: 0, y: 70 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    >
                        <BlueCircle />
                        <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold">특징</h1>
                        <div>
                            <div className="flex gap-[30px] mt-[30px]">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex flex-col gap-[10px]">
                                        <div className="bg-gradient-to-l from-transparent to-[#367DF8] px-[30px] py-[10px] mb-[10px] rounded-[10px]">
                                            <h2 className="text-[25px] font-bold">{feature.featureSummary}</h2>
                                        </div>
                                        <p className="text-[16px] font-medium">* {feature.featureOverview}</p>
                                        <p className="text-[16px] font-medium">* {feature.featureDetail}</p>
                                    </div>
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
                                    <img src={infoIcon} alt="info" className=" w-[30px] h-[30px]" />
                                    <p className="text-[16px] font-bold">SESIM을 처음이용하신다면, [마이페이지]에서 SESIM SDK를 먼저 다운로드 하세요!</p>
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
                )}
            </div>
        </div>
    );
};