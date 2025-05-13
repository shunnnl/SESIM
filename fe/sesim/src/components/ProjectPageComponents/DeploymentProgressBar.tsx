import React from "react";
import Lottie from "react-lottie-player";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { Step } from "../../types/ProjectTypes";
import loading from "../../assets/lotties/pendingLottie.json";
import deployed from "../../assets/lotties/deployedLottie.json";

const stepDescriptions: Record<number, { main: string; sub: string[] }> = {
    1: { main: "인프라 생성", sub: ["EC2 생성", "VPC 구성", "방화벽 생성"] },
    2: { main: "환경 구축", sub: ["K3s 설치", "Nginx 설치"] },
    3: { main: "서버 배포", sub: ["프론트 서버", "AI 서버", "DB"] },
    4: { main: "배포 완료", sub: [] },
};

const stateConfig = {
    DEPLOYED: {
        icon: 
            <div className="w-14 h-14 flex items-center justify-center">
                <IoCheckmarkSharp className="w-6 h-6"/>
            </div>,
    },
    DEPLOYING: {
        icon: (
            <div className="w-14 h-14 flex items-center justify-center">
                <Lottie animationData={loading} play loop style={{ width: "100px", height: "100px" }} />
            </div>
        ),
    },
    FAILED: {
        icon: <IoCloseSharp className="text-3xl text-darkitembg" />,
    },
};

interface Props {
    steps: Step[];
}

const DeploymentProgressBar: React.FC<Props> = ({ steps }) => {
    const renderStateIcon = (step: Step) => {
        if (step.stepStatus === "FAILED") {
            return <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#D1D5DB] z-10">{stateConfig.FAILED.icon}</div>;
        }

        if (step.stepStatus === "DEPLOYED" && step.stepOrder === 4) {
            return (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#EA49FF] z-10">
                    <Lottie animationData={deployed} play loop style={{ width: "56px", height: "56px" }} />
                </div>
            );
        }

        const borderStyle =
            step.stepStatus === "DEPLOYING"
                ? { borderWidth: "3px", borderColor: "#EA49FF", borderStyle: "solid" }
                : step.stepStatus === "PENDING"
                ? { borderWidth: "3px", borderColor: "#D1D5DB", borderStyle: "solid" }
                : {};

        return (
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                    step.stepStatus === "DEPLOYED" ? "bg-blue-500" : "bg-darkitembg"
                }`}
                style={borderStyle}
            >
                {stateConfig[step.stepStatus as keyof typeof stateConfig]?.icon}
            </div>
        );
    };

    const getGradientColor = (idx: number) => {
        const current = steps[idx];
        const next = steps[idx + 1];
        if (!next) return "from-gray-400 to-gray-300";

        if (idx === steps.length - 2 && next.stepStatus === "DEPLOYED") {
            return "from-[#495AFF] to-[#EA49FF]";
        }

        if (next.stepStatus === "DEPLOYED") {
            return "from-blue-500 to-blue-500";
        }

        if (next.stepStatus === "DEPLOYING" && current.stepStatus === "DEPLOYED") {
            return "from-[#495AFF] to-[#EA49FF]";
        }

        return "from-gray-400 to-gray-300";
    };

    return (
        <div className="text-white mb-6">
            <div className="flex items-center mb-6 ml-3">
                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                <h3 className="text-lg font-semibold">배포 상태</h3>
            </div>
            <div className="flex justify-between mx-8 relative">
                {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1;

                    return (
                        <div key={step.stepId} className="flex flex-col items-center relative w-1/3">
                            {renderStateIcon(step)}

                            <p className="text-center text-lg font-semibold mt-3 text-white mb-2">
                                {step.stepOrder === 4 && step.stepStatus === "DEPLOYING"
                                    ? "배포중"
                                    : stepDescriptions[step.stepOrder]?.main}
                            </p>

                            <ul className="text-sm text-gray-300 list-disc list-inside">
                                {stepDescriptions[step.stepOrder]?.sub.map((desc, i) => (
                                    <li key={i}>{desc}</li>
                                ))}
                            </ul>

                            {!isLast && (
                                <div className="absolute top-6 left-1/2 w-full h-1 z-0">
                                    <div
                                        className={`h-1 w-full bg-gradient-to-r ${getGradientColor(idx)}`}
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
    );
};

export default DeploymentProgressBar;
