import { UserGuideStep1 } from "./UserGuideStep1";
import { UserGuideStep2 } from "./UserGuideStep2";
import { UserGuideStep3 } from "./UserGuideStep3";

export const UserGuideSection = () => {
    return (
        <div>
            <UserGuideStep1 />
            <UserGuideStep2 />
            <UserGuideStep3 />
        </div>
    );
};
