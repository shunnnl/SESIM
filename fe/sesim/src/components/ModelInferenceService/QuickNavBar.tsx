import React, { useEffect, useState } from "react";

const stepTitles = [
    "STEP 1. IAM Role 연결",
    "STEP 2. 프로젝트 기본 정보",
    "STEP 3. 보안 AI 모델 선택",
    "STEP 4. 서버 사양 선택",
    "STEP 5. 접근 허용 IP 등록"
];

export const QuickNavBar = ({ stepRefs }: { stepRefs: React.RefObject<HTMLDivElement | null>[] }) => {
    const [activeIdx, setActiveIdx] = useState(0);

    const handleClick = (idx: number) => {
        const ref = stepRefs[idx].current;
        if (ref) {
            const y = ref.getBoundingClientRect().top + window.scrollY - 150;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            // 각 스텝의 top값을 구함
            const tops = stepRefs.map(ref => ref.current ? ref.current.getBoundingClientRect().top : Infinity);
            // 화면 상단에서 150px 위에 닿은(150 이하) 것 중 가장 큰 top값(즉, 가장 최근에 지난 스텝)
            const visibleIdx = tops.reduce((acc, top, idx) => (top <= 150 && (acc === -1 || top > tops[acc]) ? idx : acc), -1);
            setActiveIdx(visibleIdx === -1 ? 0 : visibleIdx);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [stepRefs]);

    return (
        <nav className="fixed top-1/4 left-2 z-50 flex flex-col gap-4 bg-[#04101D] bg-opacity-80 rounded-xl p-4 shadow-lg">
            {stepTitles.map((title, idx) => (
                <button
                    key={title}
                    onClick={() => handleClick(idx)}
                    className={`text-left text-sm px-4 py-2 rounded transition-all font-bold ${activeIdx === idx
                            ? "bg-[#3893FF] text-white shadow"
                            : "bg-transparent text-[#B8B8B8] hover:bg-[#15305F] hover:text-white"
                        }`}
                >
                    {title}
                </button>
            ))}
        </nav>
    );
}; 