import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { RiArrowRightWideLine } from "react-icons/ri";
import { Model } from "../../types/ProjectTypes";
import bgImage from "../../assets/images/model-bg-1.webp";
import bgImage2 from "../../assets/images/model-bg-2.webp";
import bgImage3 from "../../assets/images/model-bg-3.webp";
import bgImage4 from "../../assets/images/model-bg-4.webp";
import bgImage5 from "../../assets/images/model-bg-5.webp";
import bgImage6 from "../../assets/images/model-bg-6.webp";
import { createDeploymentApiKey } from "../../services/apiKeyService";
import { toast } from "react-toastify";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

interface AIModelListProps {
    items: Model[];
    projectId: number;
    isDeployed: boolean;
}

const AIModelListItem: React.FC<AIModelListProps> = ({ items, projectId, isDeployed }) => {
    const BG_IMAGES = [bgImage, bgImage2, bgImage3, bgImage4, bgImage5, bgImage6];
    const [apiKeys, setApiKeys] = useState<{ [key: number]: string }>({});

    const handleGenerateKey = async (projectId: number, modelId: number) => {
        try {
            const apiKey = await createDeploymentApiKey({ projectId, modelId });
            if (!apiKey) {
                console.warn("API 키가 비어있습니다.");
                return;
            }

            await navigator.clipboard.writeText(apiKey);
            setApiKeys((prev) => ({ ...prev, [modelId]: apiKey }));

            toast.success(
                <div className="flex items-center justify-center gap-2">
                    <IoIosCheckmarkCircleOutline className="text-xl text-white" />
                    <span>API Key가 복사되었습니다.</span>
                </div>,
                {
                    position: "top-center",
                    autoClose: 1000,
                    hideProgressBar: true,
                    closeButton: false,
                    icon: false,
                    style: {
                        background: "#242C4D",
                        color: "#fff",
                        borderRadius: "10px",
                        padding: "5px 20px",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }
                }
            );
        } catch (error) {
            console.error("API 키 생성 실패:", error);
            alert("API 키 생성에 실패했습니다.");
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => {
                const backgroundImage = BG_IMAGES[item.modelId % 6];
                return (
                    <div
                        key={item.modelId}
                        className="relative rounded-2xl h-35 overflow-hidden"
                        style={{
                            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-70 rounded-2xl z-0" />

                        {!isDeployed && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 z-20 rounded-2xl" />
                        )}
                        <div className="relative z-10 p-6">
                            <p className="text-sm mb-1">{item.description}</p>
                            <p className="text-xl font-semibold mb-4">{item.modelName}</p>

                            <div className="flex items-center justify-between mt-4">
                                <button
                                    className="flex items-center gap-1 text-white text-xs font-normal px-4 py-1 hover:bg-gradient-to-r hover:from-[#5A316C] hover:via-[#513176] hover:to-[#2C3273]"
                                    style={{
                                        position: "relative",
                                        border: "1px solid transparent",
                                        borderRadius: "9999px",
                                        backgroundImage:
                                            "linear-gradient(#020207, #020207), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                                        backgroundOrigin: "border-box",
                                        backgroundClip: "padding-box, border-box",
                                        color: "white",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundImage =
                                            "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundImage =
                                            "linear-gradient(#020207, #020207), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                                    }}
                                    onClick={() => handleGenerateKey(projectId, item.modelId)}
                                >
                                    API key
                                    <FaRegCopy className="text-xs text-white" />
                                </button>

                                <a
                                    href={item.grafanaUrl}
                                    className="text-white text-xs cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        대시보드 바로가기
                                        <RiArrowRightWideLine className="ml-2" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AIModelListItem;
