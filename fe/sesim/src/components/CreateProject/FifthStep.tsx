import { useState, useEffect, forwardRef, RefObject } from "react";
import { CheckMyIp } from "./CheckMyIp";
import { IoClose } from "react-icons/io5";
import { BsCircleFill } from "react-icons/bs";
import { FormStepHeader } from "./FormStepHeader"

interface FifthStepProps {
    show: boolean;
    setFifthStepDone: (done: boolean) => void;
    currentStep: number;
}

// IP 형식 검증 함수
const isValidIP = (ip: string): boolean => {
    // IPv4 형식 검증
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // CIDR 형식 검증
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

    if (ipv4Regex.test(ip)) {
        const parts = ip.split('.');
        return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
    }

    if (cidrRegex.test(ip)) {
        const [ipPart, cidrPart] = ip.split('/');
        const parts = ipPart.split('.');
        const cidr = parseInt(cidrPart);
        return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255) && cidr >= 0 && cidr <= 32;
    }

    return false;
};

// IP 추가 함수
const handleAddIP = (ipInput: string, ipList: string[], setIpList: React.Dispatch<React.SetStateAction<string[]>>, setIpInput: React.Dispatch<React.SetStateAction<string>>, setError: React.Dispatch<React.SetStateAction<string>>) => {
    if (isValidIP(ipInput)) {
        if (ipList.includes(ipInput)) {
            setError("이미 등록된 IP 주소입니다.");
            setIpInput("");
        } else {
            setIpList([...ipList, ipInput]);
            setIpInput("");
            setError("");
        }
    } else {        
        setError("올바른 IP 주소 형식이 아닙니다.");
        setIpInput("");
    }
};

// IP 삭제 함수
const handleDeleteIP = (index: number, ipList: string[], setIpList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setIpList(ipList.filter((_, ipIndex) => ipIndex !== index));
};

export const FifthStep = forwardRef<HTMLDivElement, FifthStepProps>(({ show, setFifthStepDone, currentStep }, ref) => {
    const [ipInput, setIpInput] = useState<string>("");
    const [ipList, setIpList] = useState<string[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (show && ref && typeof ref !== "function" && (ref as RefObject<HTMLDivElement>).current) {
            setTimeout(() => {
                const el = (ref as RefObject<HTMLDivElement>).current!;
                const top = el.getBoundingClientRect().top + window.scrollY;
                const offset = 100;
                const scrollTo = Math.max(0, top - offset);
                window.scrollTo({ top: scrollTo, behavior: "smooth" });
            }, 100);
        }
    }, [show, ref]);

    useEffect(() => {
        setFifthStepDone(ipList.length > 0);
    }, [ipList, setFifthStepDone]);

    return (
        <div 
            ref={ref}
            className={`${show ? "block" : "hidden"} mt-[120px]`}
        >
            <FormStepHeader
                step="05"
                title="접근 허용 IP 등록"
                description1="AI 모델이 배포된 개인망에 접근할 수 있도록, 허용할 IP를 등록해주세요."
                description2="등록된 IP에서만 대시보드에 접속이 가능합니다."
                currentStep={currentStep}
            />
            <div className="mt-[30px]">
                <div className="flex gap-[200px] w-fit bg-[#242C4D] rounded-[20px] border-[#505671] border-[1px] shadow-[0_0_30px_rgba(145,184,196,0.2)] px-[45px] py-[30px]">
                    <div>
                        <div>
                            <p className="text-[16px] font-bold">접속 허용 IP 주소 입력 <span className="text-[#FF7E7E]">*</span></p>
                            <div className="flex flex-row items-center gap-[20px]">
                                <input 
                                    type="text"
                                    maxLength={100}
                                    value={ipInput}
                                    onChange={(e) => {
                                        setIpInput(e.target.value);
                                        setError("");
                                    }}
                                    className="mt-[15px] w-[300px] h-[50px] bg-transparent border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#ffffff] placeholder:text-[#A3A3A3]" 
                                    placeholder="예: 192.168.0.1 또는 10.0.0/24"
                                />
                                <button 
                                    className="w-[100px] mt-[10px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] p-[10px] flex flex-row items-center gap-[10px] h-[50px] hover:bg-[#3C4061] transition-colors duration-200 disabled:bg-[#44485e] disabled:text-[#A3A3A3] disabled:cursor-not-allowed"
                                    onClick={() => handleAddIP(ipInput, ipList, setIpList, setIpInput, setError)}
                                >
                                    <p className="text-[16px] font-medium">IP 주소 등록</p>
                                </button>
                            </div>
                            {error && (
                                <p className="mt-2 text-[14px] text-[#FF7E7E]">{error}</p>
                            )}
                        </div>
                        <CheckMyIp />
                    </div>

                    { ipList.length > 0 && (
                        <div className="flex flex-col gap-[10px] mr-[100px]">
                            <p className="text-[16px] font-bold">등록된 IP 목록 <span className="text-[#FF7E7E]">*</span></p>
                            {ipList.map((ip, index) => (
                                <div 
                                    key={index} 
                                    className="flex flex-row items-center gap-[50px] animate-slideIn"
                                >
                                    <div className="flex flex-row items-center gap-[10px]">
                                        <BsCircleFill className=" text-[6px]" />
                                        <p className="text-[16px] font-medium">{ip}</p>
                                    </div>
                                    <div
                                        className="flex flex-row items-center cursor-pointer hover:text-[#FF7E7E] hover:scale-110 transition-colors duration-200"
                                        onClick={() => handleDeleteIP(index, ipList, setIpList)}
                                    >
                                        <IoClose className="text-[#FF7E7E] text-[20px]" />
                                        <p>삭제</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
