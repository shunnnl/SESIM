import React, { useState } from "react";
import Lottie from "react-lottie-player";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { RiArrowUpSFill, RiArrowDownSFill } from "react-icons/ri";
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
        icon: (
            <div className="w-14 h-14 flex items-center justify-center">
                <IoCheckmarkSharp className="w-6 h-6" />
            </div>
        ),
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
    const deployingStep = steps.find((step) => step.stepStatus === "DEPLOYING");
    const failedStep = steps.find((step) => step.stepStatus === "FAILED");
    const allDeployed = steps.every((step) => step.stepStatus === "DEPLOYED");

    const [isOpen, setIsOpen] = useState(() => {
        if (deployingStep) return true;
        if (failedStep || allDeployed) return false;
        return true;
    });

    let statusText = "";
    let statusColor = "";
    let statusBgStyle = {};

    if (deployingStep) {
        statusText = `${stepDescriptions[deployingStep.stepOrder]?.main} 진행중`;
        statusColor = "text-[#A196FF]";
        statusBgStyle = { backgroundColor: "rgba(167, 73, 255, 0.2)" };
    } else if (failedStep) {
        statusText = `${stepDescriptions[failedStep.stepOrder]?.main} 실패`;
        statusColor = "text-[#FF9698]";
        statusBgStyle = { backgroundColor: "rgba(255, 73, 73, 0.2)" };
    } else if (allDeployed) {
        statusText = "배포완료";
        statusColor = "text-[#96FFB2]";
        statusBgStyle = { backgroundColor: "rgba(73, 255, 167, 0.2)" };
    }

    const renderStateIcon = (step: Step) => {
        if (step.stepStatus === "FAILED") {
            return (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e56161] z-10">
                    {stateConfig.FAILED.icon}
                </div>
            );
        }

        if (step.stepStatus === "DEPLOYED" && step.stepOrder === 4) {
            return (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#8849C7] z-10">
                    <Lottie animationData={deployed} play loop style={{ width: "56px", height: "56px" }} />
                </div>
            );
        }

        const borderStyle =
            step.stepStatus === "DEPLOYING"
                ? { borderWidth: "3px", borderColor: "#8849C7", borderStyle: "solid" }
                : step.stepStatus === "PENDING"
                    ? { borderWidth: "3px", borderColor: "#D1D5DB", borderStyle: "solid" }
                    : {};

        return (
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${step.stepStatus === "DEPLOYED" ? "bg-blue-500" : "bg-darkitembg"
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
            return "from-[#6589F0] to-[#8849C7]";
        }

        if (next.stepStatus === "DEPLOYED") {
            return "from-blue-500 to-blue-500";
        }

        if (next.stepStatus === "DEPLOYING" && current.stepStatus === "DEPLOYED") {
            return "from-[#6589F0] to-[#8849C7]";
        }

        return "from-gray-400 to-gray-300";
    };

    return (
        <div>
            <div className="flex items-center my-8 ml-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                <h3 className="text-lg font-semibold mr-2">배포 상태</h3>
                {statusText && (
                    <span
                        className={`text-xs font-medium ml-2 px-3 py-[1.5px] rounded-full ${statusColor}`}
                        style={statusBgStyle}
                    >
                        {statusText}
                    </span>
                )}
                <span className="text-2xl">{isOpen ? <RiArrowUpSFill /> : <RiArrowDownSFill />}</span>
            </div>

            {isOpen && (
                <div className="flex justify-between mx-6 my-8 relative">
                    {steps.map((step, idx) => {
                        const isLast = idx === steps.length - 1;

                        return (
                            <div key={step.stepId} className="flex flex-col items-center relative w-1/3">
                                {renderStateIcon(step)}

                                <p className="text-center text-base font-semibold mt-3 text-white mb-2">
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
            )}
        </div>
    );
};

export default DeploymentProgressBar;