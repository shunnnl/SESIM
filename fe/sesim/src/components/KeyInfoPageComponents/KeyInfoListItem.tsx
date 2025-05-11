import React, { useState } from "react";
import Lottie from "react-lottie-player";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { APIKeyModal } from "../Popup/APIKeyModal";
import loading from "../../assets/lotties/pendingLottie.json";
import deployed from "../../assets/lotties/deployedLottie.json";
import { Project, Step, Model } from "../../types/keyinfoTypes";
import { createDeploymentApiKey } from "../../services/apiKeyService";

interface Props {
    project: Project;
}

const stepDescriptions: Record<number, { main: string; sub: string[] }> = {
    1: { main: "인프라 생성", sub: ["EC2 생성", "VPC 구성", "방화벽 생성"] },
    2: { main: "환경 구축", sub: ["K3s 설치", "Nginx 설치"] },
    3: { main: "서버 배포", sub: ["프론트 서버", "AI 서버", "DB"] },
    4: { main: "배포 완료", sub: [] },
};

const stateConfig = {
    DEPLOYED: {
        label: "배포 완료",
        icon: <IoCheckmarkSharp className="text-2xl text-white" />,
        textClass: "text-green-500",
    },
    DEPLOYING: {
        label: "배포 중",
        icon: (
            <div className="w-14 h-14 flex items-center justify-center">
                <Lottie
                    animationData={loading}
                    play
                    loop
                    style={{ width: "100px", height: "100px" }}
                />
            </div>
        ),
        textClass: "text-blue-500",
    },
    FAILED: {
        label: "배포 실패",
        icon: <IoCloseSharp className="text-3xl text-white" />,
        textClass: "text-red-500",
    },
};

const KeyinfoItemList: React.FC<Props> = ({ project }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{
        projectName: string;
        modelName: string;
    } | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = async (item: Model) => {
        setSelectedItem({
            projectName: project.projectName,
            modelName: item.modelName,
        });
        setIsLoading(true);

        try {
            const result = await createDeploymentApiKey({ projectId: project.projectId, modelId: item.modelId });
            console.log("API 키 생성 요청 결과:", result, project, item.modelId);
            if (result.apiKey) {
                console.log("API 키 로드 성공", result.apiKey);
                setApiKey(result.apiKey);
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
        if (stepStatus === "FAILED") {
            return {
                label: "배포 실패",
                icon: <IoCloseSharp className="text-3xl text-white" />,
                textClass: "text-red-500",
                bgClass: "bg-red-600",
            };
        }

        return (
            stateConfig[stepStatus as keyof typeof stateConfig] ?? {
                label: "알 수 없음",
                icon: null,
                textClass: "text-gray-400",
                bgClass: "bg-darkitembg",
            }
        );
    };

    const renderButton = (project: Project, model: Model) => {
        const isDeployed = project.steps[3]?.stepStatus === "DEPLOYED";
        const hasChecked = model.apiKeyCheck;
        const isClickable = isDeployed && !hasChecked;

        return (
            <button
                className={`text-base rounded-full px-3 py-1 w-36 ml-4 relative z-0 ${isClickable
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
                        handleOpenModal(model);
                    }
                }}
                disabled={!isClickable || isLoading}
            >
                API Key 확인
            </button>
        );
    };

    const getGradientColor = (steps: Step[], idx: number) => {
        const current = steps[idx];
        const next = steps[idx + 1];
        if (!next) return "from-gray-400 to-gray-300";

        if (idx === steps.length - 2 && next.stepStatus === "DEPLOYED") {
            return "from-[#495AFF] to-[#EA49FF]";
        }

        if (next.stepStatus === "DEPLOYED") return "from-blue-500 to-blue-500";
        if (next.stepStatus === "DEPLOYING" && current.stepStatus === "DEPLOYED") {
            return "from-[#495AFF] to-[#EA49FF]";
        }

        return "from-gray-400 to-gray-300";
    };

    return (
        <div className="bg-darkitembg rounded-xl p-4 border border-slate-500 shadow-md mb-2">
            <div className="flex items-center mb-4 ml-3">
                <h2 className="text-2xl font-bold text-white pb-2">
                    {project.projectName}
                </h2>
            </div>

            {/*배포상태*/}
            <div className="text-white mb-6">
                <div className="flex items-center mb-6 ml-3">
                    <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                    <h3 className="text-lg font-semibold">배포 상태</h3>
                </div>
                <div className="flex justify-between mx-8 relative">
                    {project.steps.map((step, idx) => {
                        const stepState = renderState(step.stepStatus);
                        const isLastStep = idx === project.steps.length - 1;
                        const isDeployed = step.stepStatus === "DEPLOYED";
                        const isDeploying = step.stepStatus === "DEPLOYING";
                        const isPending = step.stepStatus === "PENDING";
                        const isFailed = step.stepStatus === "FAILED";

                        const borderStyle = isDeploying
                            ? { borderWidth: "3px", borderColor: "#EA49FF", borderStyle: "solid" }
                            : isPending
                                ? { borderWidth: "3px", borderColor: "#D1D5DB", borderStyle: "solid" }
                                : {};

                        return (
                            <div
                                key={step.stepId}
                                className="flex flex-col items-center relative w-1/3"
                            >

                                {isDeployed && step.stepOrder === 4 ? (
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#EA49FF] z-10">
                                        <Lottie
                                            animationData={deployed}
                                            play
                                            loop
                                            style={{ width: "56px", height: "56px" }}
                                        />
                                    </div>
                                ) : isFailed ? (
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-600 z-10">
                                        <IoCloseSharp className="text-3xl text-white" />
                                    </div>
                                ) : (
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${isDeployed ? "bg-blue-500" : "bg-darkitembg"}`}
                                        style={borderStyle}
                                    >
                                        {stepState.icon}
                                    </div>
                                )}

                                <p className="text-center text-lg font-semibold mt-3 text-white mb-2">
                                    {stepDescriptions[step.stepOrder]?.main}
                                </p>
                                <ul className="text-sm text-gray-300 list-disc list-inside">
                                    {stepDescriptions[step.stepOrder]?.sub.map((desc, i) => (
                                        <li key={i}>{desc}</li>
                                    ))}
                                </ul>

                                {!isLastStep && (
                                    <div className="absolute top-6 left-1/2 w-full h-1 z-0">
                                        <div
                                            className={`h-1 w-full bg-gradient-to-r ${getGradientColor(
                                                project.steps,
                                                idx
                                            )}`}
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                height: "4px",
                                            }}
                                        />
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
            <div className="container mx-auto px-5 pb-3">
                <table className="w-full text-white text-center">
                    <thead>
                        <tr className="border-b border-gray-600">
                            <th className="py-3 px-4">모델명</th>
                            <th className="py-3 px-4">ALB주소</th>
                            <th className="py-3 px-4">API Key</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.models.map((model) => (
                            <tr key={model.modelId}>
                                <td className="py-3 px-4">{model.modelName}</td>
                                <td className="py-3 px-4">
                                    <a
                                        href={project.albAddress}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white underline"
                                    >
                                        {project.albAddress}
                                    </a>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex justify-center items-center">
                                        {renderButton(project, model)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedItem && apiKey && (
                <APIKeyModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    projectName={selectedItem.projectName}
                    modelName={selectedItem.modelName}
                    apiKey={apiKey}
                />
            )}
        </div>
    );
};

export default KeyinfoItemList;