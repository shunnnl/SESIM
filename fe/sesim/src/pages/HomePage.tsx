export const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col gap-[72px] text-white h-screen justify-center">
            <div className="flex flex-col gap-[24px] text-white">
                <p className="text-4xl font-bold">
                    민감한 데이터를 지키는
                    <br />
                    가장 신뢰할 수 있는 AI 보안 솔루션
                </p>
                <p className="text-xl font-medium">
                    AI가 고객 인프라 내부에서 직접 작동하여
                    <br />
                    외부 유출 없이 보안 위협을 실시간으로 감지합니다.
                </p>
            </div>

            <div>
                <button>
                    <p className="text-white text-xl font-bold">
                        자세히보기
                    </p>
                </button>
            </div>
        </div>

    );
};
