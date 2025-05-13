import { Project } from "../../types/ProjectTypes";
import DeploymentProgressBar from "./DeploymentProgressBar";
import AIModelListItem from "./AIModelListItem";

interface Props {
    project: Project;
}

const ProjectItemList: React.FC<Props> = ({ project }) => {

    return (
        <div className="bg-darkitembg rounded-xl p-4 border border-slate-500 shadow-md mb-2">
            <div className="flex items-center ml-3">
                <h2 className="text-2xl font-bold text-white pb-2">
                    {project.projectName}
                </h2>
            </div>

            <div className="flex items-center ml-3 mt-2 mb-4">
                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                <h1 className="font-semibold text-lg">프로젝트 정보</h1>
            </div>
            <div className="flex items-center ml-3 mt-2 mb-4">
                <p>ALB주소 : </p>
                <p className="ml-2">{project.albAddress}</p>
            </div>

            <div className="flex items-center ml-3 mt-2 mb-4">
            <button className="bg-sky-800 p-2 rounded-full">허용ip 확인</button>
            </div>

            {/*배포상태*/}
            <DeploymentProgressBar steps={project.steps} />

            <div className="flex items-center ml-3 mt-12 mb-4">
                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                <h1 className="font-semibold text-lg">모델 리스트</h1>
            </div>
            <AIModelListItem items={project.models} />
        </div>
    );
};

export default ProjectItemList;