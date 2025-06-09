export const ScrollToTopButton = ({ show, extraBottom = 32 }: { show: boolean; extraBottom?: number }) => {
    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return show ? (
        <button
            onClick={handleClick}
            className="fixed right-8 z-[999] bg-[#15305F] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-[#1e418a] transition-colors"
            style={{
                bottom: extraBottom,
                transition: "bottom 0.4s cubic-bezier(0.4,0,0.2,1)"
            }}
            aria-label="맨 위로"
        >
            <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7-7 7 7"
                />
            </svg>
        </button>
    ) : null;
}; 