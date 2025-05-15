import React, { useRef, useState, useEffect } from "react";
import { QuickNavBar } from "./QuickNavBar";
import { UserGuideStep1 } from "./UserGuideStep1";
import { UserGuideStep2 } from "./UserGuideStep2";
import { UserGuideStep3 } from "./UserGuideStep3";
import { UserGuideStep4 } from "./UserGuideStep4";
import { UserGuideStep5 } from "./UserGuideStep5";

interface UserGuideSectionProps {
    initialStep?: number;
}

export const UserGuideSection = ({ initialStep }: UserGuideSectionProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const stepRefs: React.RefObject<HTMLDivElement | null>[] = [
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
    ];
    const [showQuickBar, setShowQuickBar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            setShowQuickBar(rect.bottom > 600 && rect.top < window.innerHeight - 600);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 페이지 진입 시 initialStep이 있으면 해당 스텝으로 스크롤
    useEffect(() => {
        if (initialStep && stepRefs[initialStep - 1]?.current) {
            const ref = stepRefs[initialStep - 1].current;
            if (ref) {
                const y = ref.getBoundingClientRect().top + window.scrollY - 150;
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        }
    }, [initialStep]);

    return (
        <div 
            ref={sectionRef} 
            className="relative flex pb-[100px]"
            style={{
                background: "linear-gradient(to bottom, #000000 0px, #04101D 1000px, #04101D 100%)"
            }}
        >
            {/* 왼쪽 퀵 네비게이션 바 */}
            <div
                className={`transition-opacity duration-300 ${showQuickBar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            >
                <QuickNavBar stepRefs={stepRefs} />
            </div>

            {/* 오른쪽 실제 스텝 내용 */}
            <div className="flex-1 ml-[120px]">
                <div ref={stepRefs[0]}><UserGuideStep1 /></div>
                <div ref={stepRefs[1]}><UserGuideStep2 /></div>
                <div ref={stepRefs[2]}><UserGuideStep3 /></div>
                <div ref={stepRefs[3]}><UserGuideStep4 /></div>
                <div ref={stepRefs[4]}><UserGuideStep5 /></div>
            </div>
        </div>
    );
};
