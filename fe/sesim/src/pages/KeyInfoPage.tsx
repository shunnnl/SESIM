import { Sidebar } from "../components/Sidebar";
import ItemList from "../components/KeyInfoPageComponents/KeyInfoListItem";

export const KeyInfoPage = () => {
    const allItems = [
        [
            {
                id: 1,
                modelName: "AuthGaurd",
                ALBaddress: "my-load-balancer-1234567890.us-west-2.elb.amazonaws.com",
                APIKeyState: "DEPLOYED",
                state: "DEPLOYED",
                APIKey: "sjdlkjdsljd-adjskjlads12"
            },
            {
                id: 2,
                modelName: "DataWatch",
                ALBaddress: "my-load-balancer-1234567890.us-west-2.elb.amazonaws.com",
                APIKeyState: "FAILED",
                state: "FAILED",
                APIKey: "sjdlkjdsljd-adjskjlads12"
            },
            {
                id: 3,
                modelName: "WebSentinel",
                ALBaddress: "my-load-balancer-1234567890.us-west-2.elb.amazonaws.com",
                APIKeyState: "DEPLOYING",
                state: "DEPLOYING",
                APIKey: "sjdlkjdsljd-adjskjlads12"
            }
        ],
        [
            {
                id: 4,
                modelName: "FileGuard",
                ALBaddress: "my-load-balancer-1234567890.us-west-2.elb.amazonaws.com",
                APIKeyState: "DEPLOYED",
                state: "DEPLOYED",
                APIKey: "sjdlkjdsljd-adjskjlads12"
            },
            {
                id: 5,
                modelName: "CloudWatch",
                ALBaddress: "my-load-balancer-1234567890.us-west-2.elb.amazonaws.com",
                APIKeyState: "FAILED",
                state: "FAILED",
                APIKey: "sjdlkjdsljd-adjskjlads12"
            },
            {
                id: 6,
                modelName: "NetworkSentinel",
                ALBaddress: "my-load-balancer-1234567890.us-west-2.elb.amazonaws.com",
                APIKeyState: "DEPLOYING",
                state: "DEPLOYING"
            }
        ]
    ];
    {/*FIXME api가 나오면 대체될 리스트 입니다! */}

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

                    <p className="text-lg font-medium m-1">
                        AI모델 별 API 키 정보를 제공합니다.
                    </p>

                    <p className="text-lg font-medium m-1">
                        API 키는 최초 1회만 확인 가능하며, 보안상의 이유로 이후에는 다시 확인하실 수 없습니다.
                    </p>
                </div>

                <div>
                    {allItems.map((itemsArray, index) => (
                        <div key={index} className="mb-6">
                            {/* 프로젝트 이름 추가 */}
                            <h2 className="text-2xl font-semibold text-white mt-4 mb-3">
                                sesim project
                            </h2>
                            <ItemList items={itemsArray} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
