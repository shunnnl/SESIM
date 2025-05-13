import React, { useState } from "react";
import { APIKeyModal } from "../Popup/APIKeyModal";
import { Project, Model } from "../../types/ProjectTypes";
import { createDeploymentApiKey } from "../../services/apiKeyService";
import ApiKeyButton from "./ApikeyButton";
import DeploymentProgressBar from "./DeploymentProgressBar";

interface Props {
    project: Project;
}

const KeyinfoItemList: React.FC<Props> = ({ project }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{
        projectName: string;
        modelName: string;
    } | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [clickedModelIds, setClickedModelIds] = useState<number[]>([]);

    const handleOpenModal = async (item: Model) => {
        setSelectedItem({
            projectName: project.projectName,
            modelName: item.modelName,
        });
        setIsLoading(true);

        try {
            const result = await createDeploymentApiKey({ projectId: project.projectId, modelId: item.modelId });
            console.log("API 키 생성 요청 결과:", result, project, item.modelId);
            if (result.data.apiKey) {
                console.log("API 키 로드 성공", result.data.apiKey);
                setApiKey(result.data.apiKey);
                setIsModalOpen(true);
                setClickedModelIds((prev) => [...prev, item.modelId]);
            } else {
                console.error("API 키 로드 실패:", result.error);
                alert("API 키를 가져오는 데 실패했습니다.");
            }
        } catch (error) {
            console.error("API 키 로드 중 오류 발생:", error);
            alert("API 키를 가져오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setApiKey(null);
    };


    const handleClick = (model: Model) => {
        if (!clickedModelIds.includes(model.modelId)) {
            handleOpenModal(model);
        }
    };

    return (
        <div className="bg-darkitembg rounded-xl p-4 border border-slate-500 shadow-md mb-2">
            <div className="flex items-center mb-4 ml-3">
                <h2 className="text-2xl font-bold text-white pb-2">
                    {project.projectName}
                </h2>
            </div>

            {/*배포상태*/}
            <DeploymentProgressBar steps={project.steps} />

            <div className="flex items-center ml-3 mt-12 mb-4">
                <div className="w-1 h-5 bg-blue-400 mr-3 rounded-sm" />
                <h1 className="font-semibold text-lg">모델 리스트</h1>
            </div>
            <div className="container mx-auto pb-3">
                <table className="w-full table-fixed text-white text-center">
                    <thead>
                        <tr className="border-b border-gray-600">
                            <th className="py-3 px-4 w-1/3">모델명</th>
                            <th className="py-3 px-4 w-1/3">ALB주소</th>
                            <th className="py-3 px-4 w-1/3">API Key</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.models.map((model) => (
                            <tr key={model.modelId}>
                                <td className="py-3 px-4">{model.modelName}</td>
                                <td className="py-3 px-4">
                                    if (project.deployed && project.albAddress != null) {
                                        <a
                                            href={project.albAddress!!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white underline"
                                        >
                                            {project.albAddress}
                                        </a>
                                    }

                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex justify-center items-center">
                                        <ApiKeyButton
                                            project={project}
                                            model={model}
                                            isClicked={clickedModelIds.includes(model.modelId)}
                                            isLoading={isLoading}
                                            onClick={handleClick}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedItem && apiKey && (
                <APIKeyModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    projectName={selectedItem.projectName}
                    modelName={selectedItem.modelName}
                    apiKey={apiKey}
                />
            )}
        </div>
    );
};

export default KeyinfoItemList;