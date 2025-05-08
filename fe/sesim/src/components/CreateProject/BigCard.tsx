export const BigCard : React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <div className="bg-[#242C4D] rounded-[20px] border-[#505671] border-[1px] shadow-[0_0_30px_rgba(145,184,196,0.2)] px-[45px] py-[30px]">
            {children}
        </div>
    );
};
