import React from "react";
import { useNavigate } from "react-router-dom";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const menuItems = [
    { id: "api", label: "API 사용량", path: "/apiusage" },
    { id: "projects", label: "대시보드", path: "/project" },
    { id: "keys", label: "키 발급", path: "/keyinfo" },
  ];

  const handleUserInfoClick = () => {
    navigate("/userinfo");
    onClose();
  };


  const handleMenuItemsClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="absolute right-0 top-1/2 translate-y-[60px] w-[180px] h-fit bg-[#07142B] rounded-[20px] shadow-[0px_0px_15px_rgba(116,208,244,0.4)] text-white font-['Pretendard'] z-50">
      <div className="flex flex-col tems-start gap-[16px] py-[20px]">
        <button
          className="font-semibold px-[32px] text-[16px] text-left hover:text-gray-400"
          onClick={handleUserInfoClick}
        >
          마이페이지
        </button>
        <div className="w-full border-t border-[#3E4865]" />
        <div className="flex flex-col items-start text-left py-[2px] gap-[22px]">
          {menuItems.map(item => (
            <button
              key={item.id}
              className="font-medium text-white/80 text-[14px] px-[32px] self-stretch text-left hover:text-gray-400"
              onClick={() => handleMenuItemsClick(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="w-full border-t border-[#3E4FF865]" />
        <button
          onClick={onLogout}
          className="font-semibold text-[16px] px-[32px] text-left hover:text-gray-400"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}; 