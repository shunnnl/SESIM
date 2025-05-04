interface Item {
    id: number;
    modelName: string;
    description: string;
    link?: string; // optional property
}

interface ItemListProps {
    items: Item[];
}

const ItemList: React.FC<ItemListProps> = ({ items }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="bg-gray-800 rounded-2xl p-6 h-44"
                    style={{
                        boxShadow: '0px 0px 10px rgba(116, 208, 244, 0.3)',
                    }}
                >
                    <p className="text-sm ml-2 mb-1">{item.description}</p>
                    <p className="text-xl font-semibold mb-2">
                        <img src="src/assets/images/logo-sesim.png" alt="icon" className="inline-block w-6 h-6" />
                        {item.modelName}
                    </p>

                    <button
                        className="text-white text-sm font-normal px-4 py-1 mt-2 hover:bg-gradient-to-r hover:from-[#5A316C] hover:via-[#513176] hover:to-[#2C3273]"
                        style={{
                            position: "relative",
                            border: "1px solid transparent",
                            borderRadius: "9999px",
                            backgroundImage: "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                            backgroundOrigin: "border-box",
                            backgroundClip: "padding-box, border-box",
                            color: "white",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundImage = "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundImage = "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                        }}
                    >
                        결과보기
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ItemList;