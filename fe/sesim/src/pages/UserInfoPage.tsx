import { Sidebar } from "../components/Sidebar";

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="mt-6 mb-6">
    <p className="text-sm text-gray-300 font-semibold">{label}</p>
    <div className="border border-gray-300 p-2 rounded-lg mt-3 w-96 h-10 flex items-center">
      <p className="text-sm m-1">{value}</p>
    </div>
  </div>
);

export const UserInfoPage = () => {
  return (
    <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
      <div className="mr-12">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 p-6 justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-12">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            회원 정보
          </h1>

          <InfoField label="닉네임" value={localStorage.getItem("nickname") || ""} />
          <InfoField label="이메일" value={localStorage.getItem("email") || ""} />
        </div>

        <div className="mt-6 ml-72">
          <button className="px-4 py-2 border border-white text-white rounded-full bg-transparent hover:bg-white hover:text-gray-900 transition-colors duration-200">
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};
