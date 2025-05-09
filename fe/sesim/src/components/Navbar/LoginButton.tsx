interface LoginButtonProps {
    onClickLoginModal: () => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ onClickLoginModal }) => {
    return (
        <>
            <button 
                className="font-bold text-white text-[15px] lg:text-[17px] px-[18px] lg:px-[22px] py-[7px] text-nowrap bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-[35px]"
                onClick={() => onClickLoginModal()}
            >
                로그인
            </button>
        </>
    )
}