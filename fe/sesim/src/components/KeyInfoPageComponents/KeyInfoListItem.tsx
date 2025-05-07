import React, { useState, useEffect } from "react";
import Lottie from "react-lottie-player";
import { IoIosCheckmarkCircleOutline, IoIosInformationCircleOutline } from "react-icons/io";
import logo from "../../assets/images/sesim-logo.png";
import loading from "../../assets/lotties/Loading.json";
import { APIKeyModal } from "../../components/Popup/APIKeyModal";
import { fetchApiKey } from "../../services/apiKeyService"; // API Key 가져오는 함수

// Model 타입 정의 (예시)
interface Model {
    id: number;
    name: string;
    albAddress: string;
    deployStatus: "DEPLOYED" | "NOT_DEPLOYED" | "DEPLOYING" | string;
    isApiKeyCheck: boolean;
    APIKey: string;
}

// props 타입 정의
interface ItemListProps {
    items: Model[]; // Model 배열을 전달
}

// 배포 상태 및 버튼 텍스트 관련 설정
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

// Model을 ListItem으로 변환하는 함수
const mapModelToListItem = (model: Model): Model => {
    return {
        id: model.id,
        name: model.name,
        albAddress: model.albAddress,
        isApiKeyCheck: model.isApiKeyCheck,
        deployStatus: model.deployStatus,
        APIKey: model.APIKey,
    };
};

const ItemList: React.FC<ItemListProps> = ({ items }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Model | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);  // API Key를 저장할 상태

    const handleOpenModal = async (item: Model) => {
        setSelectedItem(item);

        if (item.deployStatus === "DEPLOYED") {
            try {
                const fetchedApiKey = await fetchApiKey({ projectId: 1, modelId: item.id });
                setApiKey(fetchedApiKey);  // 가져온 API Key를 상태에 저장
            } catch (error) {
                if (error instanceof Error) {
                    console.error("API Key fetch failed:", error.message);  // 오류 메시지 출력
                } else {
                    console.error("API Key fetch failed:", error);  // 객체 자체 출력
                }
                setApiKey(null);  // 오류 발생 시 null로 설정
            }
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setApiKey(null);  // 모달 닫을 때 API Key 초기화
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
        return (
            <button
                className={`text-base rounded-full px-3 py-1 w-32 ml-4 relative z-0 ${isDeployed
                    ? "text-white hover:bg-gradient-to-r hover:from-gradientpink30 hover:via-gradientpurple30 hover:to-gradientblue30"
                    : "text-gray-300 bg-gray-500 border border-gray-300 cursor-not-allowed"}`}
                style={isDeployed ? {
                    position: "relative",
                    border: "2px solid transparent",
                    borderRadius: "9999px",
                    backgroundImage: "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                    color: "white",
                } : undefined}
                onMouseEnter={(e) => {
                    if (isDeployed) {
                        e.currentTarget.style.backgroundImage = "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (isDeployed) {
                        e.currentTarget.style.backgroundImage = "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                    }
                }}
                onClick={() => {
                    if (isDeployed && item) {
                        handleOpenModal(item);
                    }
                }}
                disabled={!isDeployed}
            >
                <span>{isDeployed ? "API Key 확인" : renderState(item.deployStatus).label}</span>
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
                        const listItem = mapModelToListItem(item); // Model을 ListItem으로 변환
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
