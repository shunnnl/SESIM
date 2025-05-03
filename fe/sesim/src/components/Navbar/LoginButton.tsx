interface LoginButtonProps {
    setIsLoginModalOpen: () => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ setIsLoginModalOpen }) => {
    return (
        <>
            <button 
                className="text-white text-[18px] font-bold bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-[35px] px-[22px] py-[7px]"
                onClick={() => setIsLoginModalOpen}
            >
                로그인
            </button>
        </>
    )
}