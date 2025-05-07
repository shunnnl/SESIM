import { motion } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import ItemList from "../components/KeyInfoPageComponents/KeyInfoListItem";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchKeyInfo } from "../services/keyinfoService";
import { RootState, AppDispatch } from "../redux/store"; // AppDispatch 추가
import { Project } from "../redux/keyinfoSlice";
export const KeyInfoPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Redux 상태에서 projects, loading, error를 불러옴
    const { projects, loading, error} = useSelector((state: RootState) => state.keyinfo);

    useEffect(() => {
        dispatch(fetchKeyInfo()); // createAsyncThunk로 자동 상태 처리
    }, [dispatch]);

    console.log("Projects:", projects);  // projects 데이터 확인


    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black ml-24 mr-32">
            <div className="mr-12">
                <Sidebar />
            </div>

            <div
                className="absolute top-[40%] right-[30%] -translate-y-1/2 w-[50px] h-[50px] rounded-full"
                style={{
                    background: "#00215A",
                    boxShadow: "0 0 160px 120px #00215A, 0 0 320px 240px #00215A",
                    opacity: 0.4,
                    zIndex: 0
                }}
            ></div>

            <motion.div
                className="flex flex-col flex-1 p-6 mt-4"
                style={{ zIndex: 1 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        키 정보
                    </h1>

                    <p className="text-lg font-medium m-1">
                        AI모델 별 API 키 정보를 제공합니다.
                    </p>

                    <p className="text-lg font-medium m-1 mb-6">
                        API 키는 최초 1회만 확인 가능하며, 보안상의 이유로 이후에는 다시 확인하실 수 없습니다.
                    </p>
                </motion.div>

                {/* 데이터 로딩 중 처리 */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p>Loading...</p>
                    </motion.div>
                )}

                {/* 오류 처리 */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-red-500">{error}</p>
                    </motion.div>
                )}

                {/* 프로젝트 데이터가 있을 때만 렌더링 */}
                <>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <pre>{JSON.stringify(projects, null, 2)}</pre>
                <p>{Array.isArray(projects)}</p>
               

                    {/* projects가 배열인지 확인 후, 배열이면 map 실행 */}
                    {Array.isArray(projects) && projects.map((project: Project, index: number) => {
                    
                        console.log("Project Data:", project); // 각 프로젝트 데이터 확인
                        return (
                            <motion.div
                                key={index}
                                className="mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                            >
                                <h2 className="text-2xl font-semibold text-white mt-4 mb-3">
                                    {project.name}
                                </h2>
                                {/* <ItemList items={project.models} /> 모델 리스트 전달 */}
                            </motion.div>
                        );
                    })}

                </>

            </motion.div>
        </div>
    );
};