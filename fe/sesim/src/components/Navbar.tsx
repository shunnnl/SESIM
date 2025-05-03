// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { LoginModal } from "./Popup/LoginModal";

// export const Navbar: React.FC = () => {
//     const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

//     return (
//         <>
//             <nav className="navbar flex justify-between items-center py-[16px] px-[178px] border-b-2 border-white/24 text-white">
//                 <div className="sesim-logo">
//                     <Link to="/">
//                         SESIM
//                     </Link>
//                 </div>
//                 <div className="nav-menu flex gap-[60px]">
//                     <Link to="/">
//                         홈
//                     </Link>
//                     <Link to="/about">
//                         소개
//                     </Link>
//                     <Link to="/ai-model">
//                         AI모델
//                     </Link>
//                     <Link to="/model-inference-service">
//                         모델추론 서비스
//                     </Link>
//                     <Link to="/docs">
//                         Docs
//                     </Link>
//                 </div>
//                 <div className="login-signup">
//                     <button onClick={() => setIsLoginModalOpen(true)}>로그인</button>
//                 </div>
//             </nav>
//             <LoginModal
//                 isOpen={isLoginModalOpen}
//                 onClose={() => setIsLoginModalOpen(false)}
//             />
//         </>
//     );
// };