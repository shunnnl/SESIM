import React, { useEffect, ReactNode } from 'react';

interface SnapScrollContainerProps {
    children: ReactNode;
    snapHeight?: number;
}

export const SnapScrollContainer: React.FC<SnapScrollContainerProps> = ({ 
    children, 
    snapHeight = window.innerHeight 
}) => {
    useEffect(() => {
        const handleScroll = (e: WheelEvent) => {
            const scrollPosition = window.scrollY;
            
            // 페이지 최상단에서 스크롤 다운할 때
            if (scrollPosition === 0 && e.deltaY > 0) {
                e.preventDefault();
                window.scrollTo({
                    top: snapHeight,
                    behavior: 'smooth'
                });
            }
            // 페이지 최상단으로 스크롤 업할 때
            else if (scrollPosition === snapHeight && e.deltaY < 0) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        };

        window.addEventListener('wheel', handleScroll, { passive: false });
        return () => window.removeEventListener('wheel', handleScroll);
    }, [snapHeight]);

    return (
        <div className="relative">
            {children}
        </div>
    );
}; 