import { memo } from 'react';
import arrowWhite from "../../assets/images/arrow-white.png";
import arrowBlue from "../../assets/images/arrow-blue.png";

const DetailButtonComponent: React.FC = () => {
    return (
        <button 
            className="group relative flex items-center justify-center gap-[10px] border-2 border-white/24 rounded-[35px] w-[190px] h-[70px] px-[24px] py-[12px] transition-all duration-300 overflow-hidden hover:border-[#6296EF]"
            style={{ willChange: 'transform, border-color' }}
        >
            {/* 흰색 배경 애니메이션 (먼저 시작) */}
            <div 
                className="absolute inset-0 bg-white rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"
                style={{ willChange: 'transform' }}
            />
            
            {/* 파란색 배경 애니메이션 (살짝 딜레이) */}
            <div 
                className="absolute inset-0 bg-[#6296EF] rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out delay-[150ms] group-hover:translate-x-0"
                style={{ willChange: 'transform' }}
            />
            
            {/* 텍스트 */}
            <p className="relative z-10 text-white text-xl font-medium select-none">
                자세히보기
            </p>

            {/* 아이콘 컨테이너 */}
            <div 
                className="relative z-10 bg-[#6296EF] rounded-full w-[30px] h-[30px] flex items-center justify-center transition-colors duration-300 group-hover:bg-white"
                style={{ willChange: 'background-color' }}
            >
                {/* 흰색 화살표 */}
                <img 
                    src={arrowWhite} 
                    alt="arrow-right" 
                    className="absolute w-[24px] h-[24px] transition-all duration-300 ease-in-out transform group-hover:translate-x-6 group-hover:-translate-y-6 group-hover:opacity-0"
                    style={{ willChange: 'transform, opacity' }}
                    loading="eager"
                />
                {/* 파란색 화살표 */}
                <img 
                    src={arrowBlue} 
                    alt="arrow-right-blue" 
                    className="absolute w-[24px] h-[24px] transition-all duration-300 ease-in-out transform -translate-x-6 translate-y-6 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                    style={{ willChange: 'transform, opacity' }}
                    loading="eager"
                />
            </div>
        </button>
    );
};

// 컴포넌트 메모이제이션
export const DetailButton = memo(DetailButtonComponent);
