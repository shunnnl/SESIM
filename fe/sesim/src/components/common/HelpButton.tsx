import { useState } from "react";

export const HelpButton = ({ up, extraBottom = 32 }: { up?: boolean; extraBottom?: number }) => {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="fixed right-8 z-[999]"
            style={{
                bottom: up ? extraBottom + 80 : extraBottom,
                transition: "bottom 0.4s cubic-bezier(0.4,0,0.2,1)"
            }}
        >
            <button
                onClick={() => { if (!open) setOpen(true); }}
                className={`
                    flex items-center justify-center
                    ${open
                        ? "w-[260px] h-[320px] rounded-3xl px-6 py-6 bg-[#15305F] shadow-2xl cursor-default"
                        : "w-14 h-14 rounded-full bg-[#15305F] cursor-pointer hover:bg-[#1e418a]"}
                    text-white transition-all duration-300 ease-in-out
                    shadow-lg
                    overflow-hidden
                    relative
                `}
                style={{
                    minWidth: open ? 260 : 56,
                    minHeight: open ? 320 : 56,
                }}
                aria-label="도움말"
                tabIndex={0}
            >
                {!open ? (
                    <span className="text-2xl font-bold">?</span>
                ) : (
                    <div className="w-full h-full flex flex-col items-start justify-start">
                        <div className="flex items-center gap-2 mb-5 w-full">
                            <span className="text-xl">📝</span>
                            <span className="text-lg font-bold">도움말</span>
                        </div>
                        <ol className="text-base font-medium space-y-4 w-full">
                            <li
                                className="text-left hover:text-[#3893FF] hover:underline cursor-pointer"
                                onClick={() => {
                                    alert("STEP 01. 사용자 가이드 준비중입니다.");
                                }}
                            >
                                01. IAM Role 연결
                            </li>
                            <li
                                className="text-left hover:text-[#3893FF] hover:underline cursor-pointer"
                                onClick={() => {
                                    alert("STEP 02. 사용자 가이드 준비중입니다.");
                                }}
                            >
                                02. 프로젝트 기본 정보
                            </li>
                            <li
                                className="text-left hover:text-[#3893FF] hover:underline cursor-pointer"
                                onClick={() => {
                                    alert("STEP 03. 사용자 가이드 준비중입니다.");
                                }}
                            >
                                03. 보안 AI 모델 선택
                            </li>
                            <li
                                className="text-left hover:text-[#3893FF] hover:underline cursor-pointer"
                                onClick={() => {
                                    alert("STEP 04. 사용자 가이드 준비중입니다.");
                                }}
                            >
                                04. 서버 사양 선택
                            </li>
                            <li
                                className="text-left hover:text-[#3893FF] hover:underline cursor-pointer"
                                onClick={() => {
                                    alert("STEP 05. 사용자 가이드 준비중입니다.");
                                }}
                            >
                                05. 접근 허용 IP 등록
                            </li>
                        </ol>
                        <button
                            className="absolute top-6 right-6 text-white text-xl hover:text-[#A3A3A3] transition"
                            onClick={e => { e.stopPropagation(); setOpen(false); }}
                            aria-label="닫기"
                        >✕</button>
                    </div>
                )}
            </button>
        </div>
    );
}; 