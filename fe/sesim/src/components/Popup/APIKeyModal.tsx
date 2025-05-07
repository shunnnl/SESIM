import { FaRegCopy } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { IoIosCheckmarkCircleOutline, IoIosInformationCircleOutline } from "react-icons/io";

interface APIKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    modelName: string;
    apiKey: string;
}

export const APIKeyModal: React.FC<APIKeyModalProps> = ({
    isOpen,
    onClose,
    projectName,
    modelName,
    apiKey
}) => {
    const handleClose = () => {
        onClose();
    };


    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        //토스트 메시지 띄우기
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
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-50 ${isOpen ? "opacity-100 animate-fadeIn" : "opacity-0 animate-fadeOut pointer-events-none"}`}
                onClick={handleClose}
            >
                <div
                    className={`relative w-[90%] sm:w-[80%] md:w-[60%] lg:w-[35%] max-h-[750px] rounded-[30px] transform transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0 animate-slideIn" : "opacity-0 translate-y-4 animate-slideOut"}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="absolute inset-0 rounded-[30px] p-[2px]"
                        style={{
                            background: "linear-gradient(to bottom right, #263F7C, #3B66AF, #035179, #5D659A)",
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                            pointerEvents: "none",
                        }}
                    />

                    <div className="flex flex-col items-center w-full h-full py-10 sm:py-12 md:py-16 px-6 sm:px-10 md:px-16 rounded-[28px] bg-[#020207]/80">
                        <span className="font-['Pretendard'] font-bold text-3xl md:text-4xl text-center text-white mb-10">
                            <img src="src/assets/images/sesim-logo.png" alt="icon" className="inline-block w-10 h-10" />
                            {modelName}
                            <p className="font-['Pretendard'] font-bold text-2xl text-center text-white">{projectName}</p>
                        </span>

                        <div className="w-fit flex flex-col gap-6 text-white font-['Pretendard']">
                            <div className="relative flex justify-center items-center py-5">
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#5D659A]" />

                                <p className="font-['Pretendard'] font-bold text-xl text-white mr-2">API Key : </p>
                                <p className="font-['Pretendard'] font-medium text-xl text-white inline-flex items-center gap-2">
                                    {apiKey}
                                    <FaRegCopy
                                        onClick={handleCopy}
                                        className="ml-3 text-m text-blue-300 hover:text-white transition"
                                    />
                                </p>
                            </div>

                            <div className="flex justify-center items-center text-center px-4">
                                <div className="flex items-start gap-2 max-w-xl">
                                    <IoIosInformationCircleOutline className="text-2xl text-[#888888] mt-1 shrink-0" />
                                    <p className="font-['Pretendard'] text-m text-center leading-relaxed bg-[linear-gradient(45deg,_#888888,_white,_#888888)] bg-clip-text text-transparent">
                                        보안을 위해 API 키는 한 번만 확인하실 수 있습니다. <br />
                                        반드시 안전한 장소에 저장해 주세요.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-10 relative rounded-[30px] p-[2px] group hover:scale-[1.01] transition-all duration-300 w-full"
                        >
                            <div
                                className="absolute inset-0 rounded-[30px] p-[2px] transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{
                                    background: "linear-gradient(to bottom right, #263F7C, #3B66AF, #035179, #5D659A)",
                                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "xor",
                                    maskComposite: "exclude",
                                    pointerEvents: "none",
                                }}
                            />
                            <div className="relative block w-full text-center rounded-[28px] font-medium text-lg md:text-xl text-white py-2 sm:py-3 transition-all duration-300 backdrop-blur-md group-hover:bg-white/[0.05]">
                                확인
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
};
