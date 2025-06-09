interface IpListModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    arrowedIpList: string[];
}

export const IpListModal: React.FC<IpListModalProps> = ({
    isOpen,
    onClose,
    projectName,
    arrowedIpList,
}) => {
    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-50 ${isOpen ? "opacity-100 animate-fadeIn" : "opacity-0 animate-fadeOut pointer-events-none"}`}
                onClick={handleClose}
            >
                <div
                    className={`relative w-[90%] sm:w-[65%] md:w-[45%] lg:w-[35%] max-h-[750px] rounded-[30px] transform transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0 animate-slideIn" : "opacity-0 translate-y-4 animate-slideOut"}`}
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
                        <span className="font-bold text-3xl md:text-4xl text-center text-white mb-10">
                            {/* <img src="src/assets/images/sesim-logo.png" alt="icon" className="inline-block w-10 h-10" /> */}
                            {projectName}
                        </span>

                        <div className="text-sm text-white mb-4 w-full flex flex-col items-center text-center">
                            {arrowedIpList.length === 0 ? (
                                <p className="text-lg">허용된 IP가 없습니다.</p>
                            ) : (
                                <>
                                    <div className="w-full max-h-[210px] overflow-y-auto px-2 custom-scrollbar flex justify-center">
                                        <ul className="list-none w-full max-w-[500px]">
                                            {arrowedIpList.map((ip, index) => (
                                                <li key={index} className="flex flex-col items-center">
                                                    <div className="flex items-center">
                                                        <p className="w-4 h-4 items-center bg-white text-black rounded-sm text-xs font-bold mr-4">IP</p>
                                                        <div className="text-white text-base text-center my-2">{ip}</div>
                                                    </div>
                                                    <div className="relative flex justify-center items-center w-full px-6 sm:px-12 md:px-20">
                                                        <div className="w-full h-[1px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#5D659A]" />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
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
        </>
    );
};
