import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IpListModal } from "./IPListModal";
import AIModelListItem from "./AIModelListItem";
import { Project } from "../../types/ProjectTypes";
import DeploymentProgressBar from "./DeploymentProgressBar";
import { fallbackCopyTextToClipboard } from "../../utils/copy";

interface Props {
    project: Project;
    index: number;
}

const ProjectItemList: React.FC<Props> = ({ project, index }) => {
    const [isIpListModalOpen, setIsIpListModalOpen] = useState(false);

    const handleCopy = () => {
        if (!project.albAddress) return;

        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(project.albAddress).then(() => {
                toast.success(
                    <div className="flex items-center justify-center gap-2">
                        <IoIosCheckmarkCircleOutline className="text-xl text-white" />
                        <span>ALB 주소가 복사되었습니다.</span>
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
                        },
                    }
                );
            }).catch((err) => {
                console.warn("Clipboard API 실패, fallback 사용:", err);
                fallbackCopyTextToClipboard(project.albAddress!!);
                toast.success(
                    <div className="flex items-center justify-center gap-2">
                        <IoIosCheckmarkCircleOutline className="text-xl text-white" />
                        <span>ALB 주소가 복사되었습니다.</span>
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
                        },
                    }
                );
            });
        } else {
            console.warn("Clipboard API 사용 불가, fallback 사용");
            fallbackCopyTextToClipboard(project.albAddress);
            toast.success(
                <div className="flex items-center justify-center gap-2">
                    <IoIosCheckmarkCircleOutline className="text-xl text-white" />
                    <span>ALB 주소가 복사되었습니다.</span>
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
                    },
                }
            );
        }
    };


    const handleIpListModalOpen = () => {
        setIsIpListModalOpen(true);
    };

    const handleIpListModalClose = () => {
        setIsIpListModalOpen(false);
    };

    return (
        <div className="bg-[#1D2433] rounded-xl p-4 py-6">
            <div className="flex flex-row items-center justify-between px-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-white">
                        {project.projectName}
                    </h2>
                    <p className="text-sm text-gray-400 font-normal mb-2">
                        {project.description}
                    </p>
                </div>

                <div className="flex items-center">
                    <button
                        className="flex items-center gap-1 text-white text-base font-normal px-4 py-1 hover:bg-gradient-to-r hover:from-[#5A316C] hover:via-[#513176] hover:to-[#2C3273]"
                        style={{
                            position: "relative",
                            border: "1px solid transparent",
                            borderRadius: "9999px",
                            backgroundImage: "linear-gradient(#242B3A, #242B3A), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                            backgroundOrigin: "border-box",
                            backgroundClip: "padding-box, border-box",
                            color: "white",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundImage = "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundImage = "linear-gradient(#242B3A, #242B3A), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                        }}
                        onClick={handleIpListModalOpen}
                    >
                        허용 IP 확인
                    </button>
                </div>
            </div>

            <div className="h-[1px] w-full bg-gray-700 px-4 my-2"></div>

            <div className="flex items-center ml-3 mt-3 mb-2">
                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                <h1 className="font-semibold text-md text-gray-200">프로젝트 정보</h1>
            </div>

            <div className="flex items-center ml-7 mt-2 mb-2">
                <p className="flex items-center text-md font-semibold">
                    <span className="inline-block w-1 h-1 rounded-full bg-white mr-2" />
                    ALB주소 :
                </p>
                <p className="ml-2 font-light">
                    {project.deployed ? `${project.albAddress}` : "배포 완료시 활성화됩니다."}
                </p>
                {project.deployed && (
                    <div
                        className="flex items-center text-sm ml-4 cursor-pointer"
                        onClick={handleCopy}
                    >
                        <FaRegCopy className="mr-1 text-[#B7C3DE] text-xs" />
                        <span className="bg-gradient-to-r from-[#B7C3DE] via-[#EEF3F5] to-[#A8C1CA] bg-clip-text text-transparent">
                            복사
                        </span>
                    </div>
                )}
            </div>

            <DeploymentProgressBar steps={project.steps} isFirstProject={index === 0} />

            <div className="flex items-center ml-3 mt-7 mb-4">
                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                <h1 className="font-semibold text-md text-gray-200">모델 리스트</h1>

                {!project.deployed && (
                    <div className="flex items-center">
                        <IoIosInformationCircleOutline className="text-gray-300 mr-1" />
                        <p className="text-sm font-light text-gray-300">배포완료 후 활성화 됩니다.</p>
                    </div>
                )}
            </div>
            <div className="mx-7">
                <AIModelListItem items={project.models} projectId={project.projectId} isDeployed={project.deployed} />
            </div>

            <ToastContainer />

            <IpListModal
                isOpen={isIpListModalOpen}
                onClose={handleIpListModalClose}
                projectName={project.projectName}
                arrowedIpList={project.allowedIps || []}
            />
        </div>
    );
};

export default ProjectItemList;
