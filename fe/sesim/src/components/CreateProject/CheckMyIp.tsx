import { useState } from "react";

export const CheckMyIp = () => {
    const [myIP, setMyIP] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
                    <p className="text-[14px] font-medium text-[#ffffff]">
                        현재 IP 주소: <span className="text-[#4ECDC4]">{myIP}</span>
                    </p>
                </div>
            )}
        </div>
    );
};
