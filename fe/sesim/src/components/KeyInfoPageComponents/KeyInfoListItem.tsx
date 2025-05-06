import React, { useState } from "react";
import Lottie from "react-lottie-player";
import { IoIosCheckmarkCircleOutline, IoIosInformationCircleOutline } from "react-icons/io";
import loading from "../../assets/lotties/Loading.json";
import { APIKeyModal } from "../../components/Popup/APIKeyModal";

interface ListItem {
    id: number;
    modelName: string;
    ALBaddress: string;
    APIKeyState: string;
    state: string;
    APIKey: string;
}

interface ItemListProps {
    items: ListItem[];
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

const ItemList: React.FC<ItemListProps> = ({ items }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);

    const handleOpenModal = (item: ListItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };


    const renderState = (state: string) => stateConfig[state as keyof typeof stateConfig];

    const renderButton = (item: ListItem) => {
        const isDeployed = item.APIKeyState === "DEPLOYED";
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
                    if (isDeployed) {
                        handleOpenModal(item);
                    }
                }}
                disabled={!isDeployed}
            >
                <span>{isDeployed ? "API Key 확인" : renderState(item.APIKeyState).label}</span>
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
                        const config = renderState(item.state);
                        return (
                            <div key={item.id} className={`flex flex-col p-4 ${index < items.length - 1 ? "border-b border-gray-600" : ""}`}>
                                <p className="text-xl font-semibold text-white flex items-center mb-2">
                                    <img src="src/assets/images/logo-sesim.png" alt="icon" className="inline-block w-8 h-8" />
                                    {item.modelName}
                                </p>

                                <p className="text-lg font-semibold text-white flex items-center gap-2 ml-2">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 inline-block mr-1" />
                                    ALB주소
                                </p>
                                <p className="text-lg text-white ml-2 mb-2">{item.ALBaddress}</p>

                                <div className="flex items-center gap-2 ml-2 mb-2">
                                    <span className="w-1 h-1 rounded-full bg-gray-400 inline-block mr-1" />
                                    <p className="text-lg font-semibold text-white">API Key</p>

                                    {renderButton(item)}

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

            {selectedItem && (
                <APIKeyModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    projectName={"sesim project"}
                    modelName={selectedItem.modelName}
                    apiKey={selectedItem.APIKey}
                />
            )}
        </>
    );
};

export default ItemList;