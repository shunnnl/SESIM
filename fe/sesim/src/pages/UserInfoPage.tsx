import { motion } from "framer-motion";
import { Sidebar } from "../components/Sidebar";

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <motion.div
    className="mt-6 mb-6"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <p className="text-lg text-gray-300 font-semibold">{label}</p>
    <div className="border border-gray-300 p-2 rounded-lg mt-3 w-7/12 h-10 flex items-center">
      <p className="text-lg m-1">{value}</p>
    </div>
  </motion.div>
);

export const UserInfoPage = () => {
  return (
    <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
      <div className="mr-12">
        <Sidebar />
      </div>

      <div
        className="absolute top-[45%] right-[30%] -translate-y-1/2 w-[50px] h-[50px] rounded-full"
        style={{
          background: "#00235D",
          boxShadow: "0 0 160px 120px #00235D, 0 0 320px 240px #00235D",
          opacity: 0.4,
          zIndex: 0,
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col flex-1 p-6 justify-between mt-4"
        style={{ zIndex: 1 }}
      >
        <div>
          <motion.h1
            className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-12"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            회원 정보
          </motion.h1>

          <InfoField label="닉네임" value={localStorage.getItem("nickname") || ""} />
          <InfoField label="이메일" value={localStorage.getItem("email") || ""} />
        </div>

        <motion.div
          className="mt-6 ml-72"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button className="px-4 py-2 border border-white text-white rounded-full bg-transparent hover:bg-white hover:text-gray-900 transition-colors duration-200">
            회원 탈퇴
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};