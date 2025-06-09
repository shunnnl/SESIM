import { LoginModal } from "../components/Popup/LoginModal";
import { SignUpModal } from "../components/Popup/SignUpModal";

interface AuthModalsProps {
    isLoginModalOpen: boolean;
    setIsLoginModalOpen: (open: boolean) => void;
    isSignUpModalOpen: boolean;
    setIsSignUpModalOpen: (open: boolean) => void;
}

export const AuthModals = ({ isLoginModalOpen, setIsLoginModalOpen, isSignUpModalOpen, setIsSignUpModalOpen}: AuthModalsProps) => {
    const handleSignUpClick = () => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
    };

    
    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
        setIsSignUpModalOpen(false);
    };

    return (
        <>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToSignUp={handleSignUpClick}
            />
            <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onSwitchToLogin={handleLoginClick}
            />
        </>
    );
}; 