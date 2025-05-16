import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import pythonIcon from "../../assets/images/python-icon.svg";

interface ExampleCodeBoxProps {
    codeString: string;
}   

export const ExampleCodeBox = ({ codeString }: ExampleCodeBoxProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div className="p-[2px] rounded-[20px] bg-gradient-to-tr from-[#45BDD3] via-[#475691] to-[#B888DF] min-w-[620px] min-h-[320px] inline-block">
            <div className="bg-gradient-to-tr from-[#2C426B] to-[#0B234F] rounded-[18px] w-full h-full min-w-[516px] min-h-[316px] p-[18px] text-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 bg-[#1E1E1E] rounded-[10px] px-3 py-2 shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                        <img 
                            src={pythonIcon} 
                            alt="python" 
                            className="w-[24px] h-[24px]" 
                        />
                        <p className="text-[16px] font-medium">Python</p>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 bg-[#232323] hover:bg-[#333] px-2 py-1 rounded-[8px] text-[13px] font-medium transition"
                    >
                        <FiCopy className="w-4 h-4" />
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
                <pre className="bg-[#1E1E1E] rounded-[10px] mt-2 px-4 py-4 shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-[12px] leading-relaxed overflow-x-auto">
                    <code className="font-mono">
                        {codeString}
                    </code>
                </pre>
            </div>
        </div>
    );
};
