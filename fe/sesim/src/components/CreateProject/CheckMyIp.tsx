import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { fallbackCopyTextToClipboard } from "../../utils/copy";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

export const CheckMyIp = () => {
    const [myIP, setMyIP] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const getMyIP = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            setMyIP(data.ip);
        } catch (error) {
            console.error('IP 주소를 가져오는데 실패했습니다:', error);
            setMyIP("IP 주소를 가져오는데 실패했습니다");
        } finally {
            setIsLoading(false);
        }
    };


    const handleCopy = () => {
        if (!myIP) return;
        const copyAction = navigator.clipboard?.writeText
            ? navigator.clipboard.writeText(myIP)
            : fallbackCopyTextToClipboard(myIP);

        Promise.resolve(copyAction)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500); 
            })
            .catch((err) => {
                console.warn("Clipboard 복사 실패:", err);
                fallbackCopyTextToClipboard(myIP);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            });
    };

    return (
        <div className="mt-[50px] flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <p
                    onClick={getMyIP}
                    className="text-[14px] font-medium text-[#4ECDC4] underline cursor-pointer hover:text-[#3DBDB4] transition-colors duration-200"
                >
                    내 IP 주소 확인하기
                </p>
                {isLoading && (
                    <span className="text-[14px] text-[#A3A3A3]">
                        확인 중...
                    </span>
                )}
            </div>

            {myIP && (
                <div className="w-[300px] bg-[#2C304B] rounded-[8px] p-3 border border-[#505671] animate-slideIn">
                    <div className="flex items-center justify-between text-[14px] font-medium text-[#ffffff]">
                        <span>
                            현재 IP 주소: <span className="text-[#4ECDC4]">{myIP}</span>
                        </span>
                        <div
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <>
                                    <IoIosCheckmarkCircleOutline className="text-[#B7C3DE] text-s" />
                                    <span className="text-[#B7C3DE] text-s">복사 완료</span>
                                </>
                            ) : (
                                <>
                                    <FaRegCopy className="text-[#B7C3DE] text-s" />
                                    <span className="bg-gradient-to-r from-[#B7C3DE] via-[#EEF3F5] to-[#A8C1CA] bg-clip-text text-transparent text-s">
                                        복사
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};