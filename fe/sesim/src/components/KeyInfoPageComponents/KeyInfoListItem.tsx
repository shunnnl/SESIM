import React, { useState } from "react";
import Lottie from "react-lottie-player";
import { IoIosCheckmarkCircleOutline, IoIosInformationCircleOutline } from "react-icons/io";
import { Model, Step } from "../../types/keyinfoTypes";
import logo from "../../assets/images/sesim-logo.png";
import loading from "../../assets/lotties/Loading.json";
import { APIKeyModal } from "../../components/Popup/APIKeyModal";
import { createDeploymentApiKey } from "../../services/apiKeyService";

interface ItemListProps {
    items: Model[];
    projectId: number;
    steps: Step[];  // Project의 Steps를 props로 받습니다.
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

const ItemList: React.FC<ItemListProps> = ({ items, projectId, steps }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Model | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = async (item: Model) => {
        setSelectedItem(item);
        setIsLoading(true);

        try {
            const result = await createDeploymentApiKey({ projectId: projectId, modelId: item.modelId });
            if (result.success) {
                console.log("API 키로드 성공", result.data.apiKey);
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

    const renderState = (stepStatus: string) => {
        return stateConfig[stepStatus as keyof typeof stateConfig] || {
            label: "알 수 없음",
            icon: null,
            textClass: "text-gray-400",
        };
    };

    const renderButton = (item: Model) => {
        const isChecked = item.apiKeyCheck;
        const isClickable = !isChecked;

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
                API Key 확인
            </button>
        );
    };

    // 프로젝트 배포 상태 (맨 상단에 표시)
    const projectStatus = steps[0]?.stepStatus || "PENDING";
    const projectState = renderState(projectStatus);

    return (
        <>
            {/* 프로젝트 상태 상단에 표시 */}
            <div className="w-full p-4 bg-gray-800 rounded-xl mb-4">
                <div className="flex items-center gap-2">
                    {projectState.icon}
                    <span className={`text-lg ${projectState.textClass}`}>{projectState.label}</span>
                </div>
            </div>

            <div
                className="w-full bg-darkitembg rounded-xl p-4 flex flex-col justify-start h-auto border border-slate-500"
                style={{
                    boxShadow: '0px 0px 10px rgba(116, 208, 244, 0.2)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                <div className="flex flex-col w-full">
                    {items.map((item, index) => {
                        const listItem = item; // 모델 정보 그대로 사용
                        return (
                            <div key={listItem.modelId} className={`flex flex-col p-4 ${index < items.length - 1 ? "border-b border-gray-600" : ""}`}>
                                <p className="text-xl font-semibold text-white flex items-center mb-2">
                                    <img
                                        src={logo}
                                        alt="icon"
                                        className="inline-block w-8 h-8"
                                    />
                                    {listItem.modelName}
                                </p>

                                <div className="flex items-center gap-2 ml-2 mb-2">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 inline-block mr-1" />
                                    <p className="text-lg font-semibold text-white">API Key</p>

                                    {/* 모델별 API 키 확인 버튼 */}
                                    {renderButton(listItem)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* API 키 모달 */}
            {selectedItem && apiKey && (
                <APIKeyModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    projectName={"sesim project"}
                    modelName={selectedItem.modelName}
                    apiKey={apiKey}  // API Key 전달
                />
            )}
        </>
    );
};

export default ItemList;
