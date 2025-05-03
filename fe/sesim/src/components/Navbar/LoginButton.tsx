import { useState } from "react";
import { LoginModal } from "../Popup/LoginModal";

export const LoginButton = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <>
            <button 
                className="text-white text-[18px] font-bold bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-[35px] px-[22px] py-[7px]"
                onClick={() => setIsLoginModalOpen(true)}
            >
                로그인
            </button>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    )
}
