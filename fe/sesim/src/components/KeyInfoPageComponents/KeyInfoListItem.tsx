import React from 'react';

interface ListItem {
    id: number; // 각 항목을 구분할 수 있는 고유한 ID
    modelName: string;
    ALBadress: string;
    APIKeyState: string;
    state: string;
}

interface ItemListProps {
    items: ListItem[];
}

const ItemList: React.FC<ItemListProps> = ({ items }) => {
    return (
        <div className="w-full bg-[#242C4D] rounded-xl p-4 flex flex-col justify-start h-auto border border-slate-500">
            <div className="flex flex-col w-full">
                {items.map((item, index) => (
                    <div
                        key={item.id} // 이제 고유한 id를 사용
                        className={`flex flex-col p-4 mb-4] ${index < items.length - 1 ? 'border-b border-gray-600' : ''}`} // 마지막 아이템에는 border 생략
                    >
                        <p className="text-xl font-semibold text-white">{item.modelName}</p>
                        <p className="text-base font-semibold text-white flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                            ABL주소
                        </p>
                        <p className="text-sm text-white">{item.ALBadress}</p>
                        <p className="text-sm text-white">{item.APIKeyState}</p>
                        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"/>
                        <p className="text-sm text-white">{item.state}</p>
                        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemList;
