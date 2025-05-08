import React, { useState } from "react";
import Lottie from "react-lottie-player";
import { IoIosCheckmarkCircleOutline, IoIosInformationCircleOutline } from "react-icons/io";
import { Model } from "../../types/keyinfoTypes";
import logo from "../../assets/images/sesim-logo.png";
import loading from "../../assets/lotties/Loading.json";
import { APIKeyModal } from "../../components/Popup/APIKeyModal";
import { createDeploymentApiKey } from "../../services/apiKeyService";

interface ItemListProps {
    items: Model[];
    projectId: number;
}

const stateConfig: Record<"DEPLOYED" | "DEPLOYING" | "FAILED", {
    label: string;
    icon: React.ReactNode;
    textClass: string;
}> = {
    DEPLOYED: {
        label: "배포 완료",
        icon: <IoIosCheckmarkCircleOutline className="text-xl text-green-500" />,
        textClass: "text-green-500",
    },
    DEPLOYING: {
        label: "배포 중",
        icon: (
            <div className="w-4 h-4 flex items-center justify-center">
                <Lottie
                    animationData={loading}
                    play={true}
                    loop={true}
                    renderer="svg"
                    style={{ width: "100px", height: "100px" }}
                />
            </div>
        ),
        textClass: "text-blue-500",
    },
    FAILED: {
        label: "배포 실패",
        icon: <IoIosInformationCircleOutline className="text-xl text-red-500" />,
        textClass: "text-red-500",
    },
};

const mapModelToListItem = (model: Model): Model => {
    return {
        id: model.id,
        name: model.name,
        albAddress: model.albAddress,
        isApiKeyCheck: model.isApiKeyCheck,
        deployStatus: model.deployStatus,
    };
};

const ItemList: React.FC<ItemListProps> = ({ items, projectId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState<Model | null>(null);

    const [apiKey, setApiKey] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = async (item: Model) => {
        setSelectedItem(item);
        setIsLoading(true);

        try {
            const result = await createDeploymentApiKey({ projectId: projectId, modelId: item.id });
            if (result.success) {
                console.log("API 키로드 성공공", result.data.apiKey);
                setApiKey(result.data.apiKey);
                setIsModalOpen(true);
            } else {
                console.error("API 키 로드 실패:", result.error);
                alert("API 키를 가져오는 데 실패했습니다.");
            }
        } catch (error) {
            console.error("API 키 로드 중 오류 발생:", error);
            alert("API 키를 가져오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setApiKey(null);
    };

    const renderState = (state: string) => {
        return stateConfig[state as keyof typeof stateConfig] || {
            label: "알 수 없음",
            icon: null,
            textClass: "text-gray-400"
        };
    };

    const renderButton = (item: Model) => {
        const isDeployed = item.deployStatus === "DEPLOYED";
        const isChecked = item.isApiKeyCheck;
        const isClickable = isDeployed && !isChecked;

        return (
            <button
                className={`text-base rounded-full px-3 py-1 w-32 ml-4 relative z-0 ${isClickable
                        ? "text-white hover:bg-gradient-to-r hover:from-gradientpink30 hover:via-gradientpurple30 hover:to-gradientblue30"
                        : "text-gray-300 bg-gray-500 border border-gray-300 cursor-not-allowed"
                    }`}
                style={
                    isClickable
                        ? {
                            position: "relative",
                            border: "2px solid transparent",
                            borderRadius: "9999px",
                            backgroundImage:
                                "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                            backgroundOrigin: "border-box",
                            backgroundClip: "padding-box, border-box",
                            color: "white",
                        }
                        : undefined
                }
                onMouseEnter={(e) => {

                    if (isClickable) {
                        e.currentTarget.style.backgroundImage =
                            "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (isClickable) {
                        e.currentTarget.style.backgroundImage =
                            "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                    }
                }}
                onClick={() => {
                    if (isClickable) {
                        handleOpenModal(item);
                    }
                }}
                disabled={!isClickable || isLoading}
            >
                <span>
                    {isLoading && selectedItem?.id === item.id
                        ? "로딩 중..."
                        : isChecked
                            ? "확인 완료"
                            : isDeployed
                                ? "API Key 확인"
                                : renderState(item.deployStatus).label}
                </span>
            </button>
        );
    };


    return (
        <>
            <div
                className="w-full bg-darkitembg rounded-xl p-4 flex flex-col justify-start h-auto border border-slate-500"
                style={{
                    boxShadow: '0px 0px 10px rgba(116, 208, 244, 0.2)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                <div className="flex flex-col w-full">
                    {items.map((item, index) => {
                        const listItem = mapModelToListItem(item);
                        const config = renderState(listItem.deployStatus);
                        return (
                            <div key={listItem.id} className={`flex flex-col p-4 ${index < items.length - 1 ? "border-b border-gray-600" : ""}`}>
                                <p className="text-xl font-semibold text-white flex items-center mb-2">
                                    <img
                                        src={logo}
                                        alt="icon"
                                        className="inline-block w-8 h-8"
                                    />
                                    {listItem.name}
                                </p>

                                <p className="text-lg font-semibold text-white flex items-center gap-2 ml-2">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 inline-block mr-1" />
                                    ALB주소
                                </p>
                                <p className="text-lg text-white ml-2 mb-2">{listItem.albAddress}</p>

                                <div className="flex items-center gap-2 ml-2 mb-2">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 inline-block mr-1" />
                                    <p className="text-lg font-semibold text-white">API Key</p>

                                    {renderButton(listItem)}

                                    <span className="w-1 h-1 rounded-full bg-gray-400 inline-block ml-4 mr-1" />
                                    <p className="text-lg text-white">배포상태</p>

                                    <div
                                        className={`text-lg px-4 flex items-center ${config?.textClass || "text-gray-700"}`}
                                    >
                                        <div className="flex items-center gap-2 text-lg">
                                            {config?.icon}
                                            <span className={config?.textClass || "text-gray-400"}>{config?.label || "알 수 없음"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedItem && apiKey && (
                <APIKeyModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    projectName={"sesim project"}
                    modelName={selectedItem.name}
                    apiKey={apiKey}  // API Key 전달
                />
            )}
        </>
    );
};

export default ItemList;