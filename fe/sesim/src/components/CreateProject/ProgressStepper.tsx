import React from "react";

interface ProgressStepperProps {
    currentStep: number;
}

const steps = [
    { label: "IAM Role 선택" },
    { label: "프로젝트 정보" },
    { label: "AI 모델 선택" },
    { label: "서버 사양 선택" },
];

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
    return (
        <div className="sticky top-0 z-40 w-full bg-[#242C4D]/80 shadow-lg backdrop-blur-md py-4">
        <div className="flex justify-center">
            {steps.map((step, idx) => (
            <React.Fragment key={idx}>
                <div className="flex flex-col items-center min-w-[160px]">
                <div className={`w-9 h-9 flex items-center justify-center rounded-full border-2
                    ${currentStep === idx
                    ? 'bg-[#3893FF] border-[#3893FF] text-white font-bold shadow-lg'
                    : currentStep > idx
                        ? 'bg-[#A3D8FF] border-[#3893FF] text-[#3893FF]'
                        : 'bg-[#23294a] border-[#505671] text-[#A3A3A3]'}
                `}>
                    {currentStep > idx ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    ) : (
                    idx + 1
                    )}
                </div>
                <span className={`mt-2 text-[15px] font-semibold ${currentStep === idx ? 'text-[#3893FF]' : 'text-[#A3A3A3]'}`}>{step.label}</span>
                </div>
                <div className="mt-4">
                    {idx < steps.length - 1 && (
                    <div className={`h-1 w-24 md:w-32 ${currentStep > idx ? 'bg-[#3893FF]' : 'bg-[#505671]'}`}></div>
                    )}
                </div>
            </React.Fragment>
            ))}
        </div>
        </div>
    );
}; 