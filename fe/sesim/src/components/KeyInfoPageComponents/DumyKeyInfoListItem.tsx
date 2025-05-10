import React, { useState } from "react";
import Lottie from "react-lottie-player";
import { IoCheckmarkSharp } from "react-icons/io5";
import loading from "../../assets/lotties/pendingLottie.json";
import depolyed from "../../assets/lotties/deployedLottie.json";
import { APIKeyModal } from "../../components/Popup/APIKeyModal";

export const mockProjects = [
    {
        projectId: 1,
        projectName: "Sesim project",
        albAddress: "http://43.200.253.103/api/",
        steps: [
            { stepId: 127, stepOrder: 1, stepName: "INFRASTRUCTURE", stepStatus: "DEPLOYED" },
            { stepId: 128, stepOrder: 2, stepName: "ENVIRONMENT", stepStatus: "DEPLOYED" },
            { stepId: 129, stepOrder: 3, stepName: "SERVER_DEPLOYMENT", stepStatus: "DEPLOYED" },
            { stepId: 130, stepOrder: 4, stepName: "COMPLETION", stepStatus: "DEPLOYED" }
        ],
        models: [
            { modelId: 1, modelName: "Finect", apiKeyCheck: true }
        ]
    },
    {
        projectId: 2,
        projectName: "AI 이미지 분석 솔루션",
        albAddress: "http://43.200.253.103/api/",
        steps: [
            { stepId: 127, stepOrder: 1, stepName: "INFRASTRUCTURE", stepStatus: "DEPLOYED" },
            { stepId: 128, stepOrder: 2, stepName: "ENVIRONMENT", stepStatus: "DEPLOYING" },
            { stepId: 129, stepOrder: 3, stepName: "SERVER_DEPLOYMENT", stepStatus: "PENDING" },
            { stepId: 130, stepOrder: 4, stepName: "COMPLETION", stepStatus: "PENDING" }
        ],
        models: [
            { modelId: 1, modelName: "Finect", apiKeyCheck: false }, { modelId: 2, modelName: "Data Watch", apiKeyCheck: false }
        ]
    },
];

const stepDescriptions: { [key: number]: { main: string; sub: string[] } } = {
    1: {
        main: "인프라 생성",
        sub: [
            "EC2 생성",
            "VPC 구성",
            "방화벽 생성"
        ]
    },
    2: {
        main: "환경 구축",
        sub: [
            "K3s 설치",
            "Nginx 설치"
        ]
    },
    3: {
        main: "서버 배포",
        sub: [
            "프론트 서버",
            "AI 서버",
            "DB"
        ]
    },
    4: {
        main: "배포 완료",
        sub: []
    }
};

const stateConfig = {
    DEPLOYED: {
        label: "배포 완료",
        icon: <IoCheckmarkSharp className="text-2xl text-white" />,
        textClass: "text-green-500"
    },
    DEPLOYING: {
        label: "배포 중",
        icon: (
            <div className="w-14 h-14 flex items-center justify-center">
                <Lottie
                    animationData={loading}
                    play={true}
                    loop={true}
                    renderer="svg"
                    style={{ width: "100px", height: "100px" }}
                />
            </div>
        ),
        textClass: "text-blue-500"
    },
    FAILED: {
        label: "배포 실패",
        icon: <IoCheckmarkSharp className="text-xl text-red-500" />,
        textClass: "text-red-500"
    }
};

const ItemList: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = async (projectName: string, model: any) => {
        setSelectedItem({ projectName, modelName: model.modelName });
        setIsLoading(true);
        setTimeout(() => {
            setApiKey("dummy-api-key-1234");
            setIsModalOpen(true);
            setIsLoading(false);
        }, 1000);
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
            textClass: "text-gray-400"
        };
    };

    const renderButton = (project: any, model: any) => {
        const isChecked = model.apiKeyCheck;
        const isClickable = !isChecked;

        return (
            <button
                className={`text-base rounded-full px-3 py-1 w-36 ml-4 relative z-0 ${isClickable
                    ? "text-white hover:bg-gradient-to-r hover:from-gradientpink30 hover:via-gradientpurple30 hover:to-gradientblue30"
                    : "text-gray-300 bg-gray-500 border border-gray-300 cursor-not-allowed"
                    }`}
                style={isClickable ? {
                    position: "relative",
                    border: "2px solid transparent",
                    borderRadius: "9999px",
                    backgroundImage:
                        "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                    color: "white"
                } : undefined}
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
                        handleOpenModal(project.projectName, model);
                    }
                }}
                disabled={!isClickable || isLoading}
            >
                API Key 확인
            </button>
        );
    };

    return (
        <>
            {mockProjects.map((project) => {
                return (
                    <div key={project.projectId} className="bg-darkitembg rounded-xl p-4 border border-slate-500 shadow-md mb-10">
                        <div className="flex items-center mb-4 ml-3">
                            <h2 className="text-2xl font-bold text-white pb-2">{project.projectName}</h2>

                        </div>

                        <div className="text-white mb-6">
                            <div className="flex items-center mb-6 ml-3">
                                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                                <h3 className="text-lg font-semibold">배포 상태</h3>
                            </div>
                            <div className="flex justify-between mx-8 relative">
                                {project.steps.map((step: any, idx: number) => {
                                    const isLastStep = idx === project.steps.length - 1;
                                    const stepState = renderState(step.stepStatus);
                                    const description = stepDescriptions[step.stepOrder];

                                    const isDeployed = step.stepStatus === "DEPLOYED";
                                    const isDeploying = step.stepStatus === "DEPLOYING";
                                    const isPending = step.stepStatus === "PENDING";

                                    const borderStyle = isDeploying
                                        ? { borderWidth: "3px", borderColor: "#EA49FF", borderStyle: "solid" }
                                        : isPending
                                            ? { borderWidth: "3px", borderColor: "#D1D5DB", borderStyle: "solid" }
                                            : {};

                                    const getGradientColor = (steps: any[], idx: number) => {
                                        const current = steps[idx];
                                        const next = steps[idx + 1];

                                        // 마지막 단계를 잇는 선일 때, 마지막 단계가 완료됐다면 파랑 → 보라
                                        if (idx === steps.length - 2 && next.stepStatus === "DEPLOYED") {
                                            return "from-[#495AFF] to-[#EA49FF]";
                                        }

                                        if (!next) return "from-gray-400 to-gray-300";

                                        const isCurrentDeployed = current.stepStatus === "DEPLOYED";
                                        const isNextDeployed = next.stepStatus === "DEPLOYED";
                                        const isNextDeploying = next.stepStatus === "DEPLOYING";

                                        if (isNextDeployed) {
                                            return "from-blue-500 to-blue-500";
                                        } else if (isNextDeploying && isCurrentDeployed) {
                                            return "from-[#495AFF] to-[#EA49FF]";
                                        } else {
                                            return "from-gray-400 to-gray-300";
                                        }
                                    };



                                    return (
                                        <div key={step.stepId} className="flex flex-col items-center relative w-1/3">
                                            {/* Circle */}
                                            {isDeployed && step.stepOrder === 4 ? (
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#EA49FF] z-10">
                                                    <Lottie
                                                        animationData={depolyed}
                                                        play={true}
                                                        loop={true}
                                                        renderer="svg"
                                                        style={{ width: "56px", height: "56px" }}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${isDeployed ? "bg-blue-500" : "bg-darkitembg"}`}
                                                    style={borderStyle}
                                                >
                                                    {stepState.icon}
                                                </div>
                                            )}

                                            {/* Step description */}
                                            <p className="text-center text-lg font-semibold mt-3 text-white mb-2">{description.main}</p>
                                            {description.sub.length > 0 && (
                                                <ul className="text-sm text-gray-300 list-disc list-inside">
                                                    {description.sub.map((item: string, idx: number) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Connector line (not for last step) */}
                                            {!isLastStep && (
                                                <div className="absolute top-6 left-1/2 w-full h-1 z-0">
                                                    <div
                                                        className={`h-1 w-full bg-gradient-to-r ${getGradientColor(project.steps, idx)}`}
                                                        style={{
                                                            position: "absolute",
                                                            top: "50%",
                                                            left: "0%",
                                                            transform: "translateY(-50%)",
                                                            width: "100%",
                                                            height: "4px",
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        <div className="flex items-center ml-3 mt-12 mb-4">
                            <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                            <h1 className="font-semibold text-lg">모델 리스트</h1>

                        </div>
                        <div className="container mx-auto px-5 pb-3
                        ">
                            <table className="w-full text-white text-center">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="py-3 px-4 align-middle">모델명</th>
                                        <th className="py-3 px-4 align-middle">ALB주소</th>
                                        <th className="py-3 px-4 align-middle">API Key</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.models.map((model: any) => (
                                        <tr key={model.modelId}>
                                            <td className="py-3 px-4 align-middle">{model.modelName}</td>
                                            <td className="py-3 px-4 align-middle">
                                                <a href={project.albAddress} className="text-white pl-4" target="_blank" rel="noopener noreferrer">
                                                    {project.albAddress}
                                                </a>
                                            </td>
                                            <td className="py-3 px-4 align-middle">
                                                <div className="flex justify-center items-center">
                                                    {renderButton(project, model)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                );
            })}

            {selectedItem && apiKey && (
                <APIKeyModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    projectName={selectedItem.projectName}
                    modelName={selectedItem.modelName}
                    apiKey={apiKey}
                />
            )}
        </>
    );
};

export default ItemList;
