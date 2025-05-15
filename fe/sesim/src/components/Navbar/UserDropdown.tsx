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
    { id: "api", label: "API 사용 대시보드", path: "/apiusage" },
    { id: "projects", label: "프로젝트", path: "/project" },
  ];

  const handleMenuItemsClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="absolute right-0 top-1/2 translate-y-[60px] w-[180px] h-fit bg-[#04101D] rounded-[20px] shadow-[0px_0px_15px_rgba(116,208,244,0.4)] text-white font-['Pretendard'] z-50">
      <div className="flex flex-col tems-start gap-[16px] py-[20px]">
        <div className="flex flex-col items-start text-left py-[2px] gap-[22px]">
          {menuItems.map(item => (
            <button
              key={item.id}
              className="font-medium text-white text-[16px] px-[32px] self-stretch text-left hover:text-gray-500"
              onClick={() => handleMenuItemsClick(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="w-full border-t border-[#3E4865]" />
        <button
          onClick={onLogout}
          className="font-semibold text-white/80 text-[14px] px-[32px] text-left hover:text-gray-500"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}; 