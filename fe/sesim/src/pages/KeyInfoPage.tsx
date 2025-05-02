import React from "react";
import { Sidebar } from "../components/Sidebar";
import ItemList from "../components/KeyInfoPageComponents/KeyInfoListItem";

export const KeyInfoPage = () => {
    const items = [
        { id: 1, modelName: '모델 1', ALBadress: '192.168.0.1', APIKeyState: '활성', state: '정상' },
        { id: 2, modelName: '모델 2', ALBadress: '192.168.0.2', APIKeyState: '비활성', state: '오류' },
        { id: 3, modelName: '모델 3', ALBadress: '192.168.0.3', APIKeyState: '활성', state: '정상' },
        { id: 4, modelName: '모델 4', ALBadress: '192.168.0.4', APIKeyState: '비활성', state: '정상' },
    ];

    return (
        <div className="flex min-h-screen text-white bg-gradient-radial from-blue-900 via-indigo-900 to-black">
            <div className="mr-12">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 p-6 mt-4">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2 mt-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        키 정보
                    </h1>
                    <p className="text-lg font-medium m-1">AI모델 별 API 키 정보를 제공합니다.</p>
                    <p className="text-lg font-medium m-1">API 키는 최초 1회만 확인 가능하며, 보안상의 이유로 이후에는 다시 확인하실 수 없습니다.</p>
                </div>

                {/* 문구 밑에 ItemList 배치 */}
                <div className="mt-4">
                    <ItemList items={items} />
                </div>
            </div>
        </div>
    );
};
