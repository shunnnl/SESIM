import { useState } from "react"
import { BigCard } from "./BigCard"
import { FormStepHeader } from "./FormStepHeader"
import cloudFormationIcon from "../../assets/images/aws-cloudformation.png"

export const FirstStep = () => {
    const [validationStatus, setValidationStatus] = useState<'none' | 'success' | 'fail'>('none')
    const [arn, setArn] = useState('')

    const handleValidation = () => {
        // NOTE: 실제 검증 로직이 들어갈 자리
        // TODO: 임시로 성공/실패를 번갈아가며 표시하도록 구현
        if (validationStatus === 'none') {
            setValidationStatus('success')
        } else if (validationStatus === 'success') {
            setValidationStatus('fail')
        } else {
            setValidationStatus('success')
        }
    }

    return (
        <>
            <FormStepHeader
                step="01"
                title="IAM Role 연결" 
                description="SaaS 포털이 고객 AWS에 접근하려면 IAM Role 연결이 필요합니다."
                must={true}
            />
            <div className="mt-[15px]">
                <BigCard>
                    <div>
                        <p className="text-[16px] font-normal text-[#979797]">* CloudFormation 템플릿을 통해 손쉽게 Role을 생성할 수 있습니다.</p>
                        <a 
                            href="https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/create/template?templateURL=https://sesimbucket.s3.ap-northeast-2.amazonaws.com/trust-role-template.yaml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-[10px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] px-[20px] py-[10px] flex flex-row items-center gap-[10px] cursor-pointer w-fit hover:bg-[#3C4061] transition-colors duration-200"
                        >
                            <img src={cloudFormationIcon} alt="cloudFormationIcon" className="w-[25px] h-[30px]" />
                            <p className="text-[20px] font-bold">CloudFormation</p>
                        </a>
                    </div>
                    <div className="mt-[30px]">
                        <p className="text-[16px] font-normal text-[#979797]">* 기존에 발급한 ARN이 있다면 아래에서 확인해 선택해 주세요.</p>
                        <select className="mt-[10px] w-[500px] bg-[#FFFFFF] border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#000000]">
                            <option value="" disabled selected>ARN을 선택해주세요</option>
                            <option value="arn1">arn:aws:iam::123456789012:role/example-role-1</option>
                            <option value="arn2">arn:aws:iam::123456789012:role/example-role-2</option>
                            <option value="arn3">arn:aws:iam::123456789012:role/example-role-3</option>
                        </select>
                    </div>

                    <div className="mt-[30px]">
                        <p className="text-[16px] font-normal text-[#979797]">* 검증할 IAM Role의 ARN을 입력하고 Assume Role 권한을 확인합니다.</p>
                        <p className="mt-[5px] text-[16px] font-bold">ARN 검증</p>
                        <div className="flex flex-row items-center gap-[20px]">
                            <input 
                                type="text" 
                                className="mt-[10px] w-[500px] bg-transparent border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#ffffff] placeholder:text-[#A3A3A3]" 
                                placeholder="ARN을 입력해주세요"
                                value={arn}
                                onChange={(e) => setArn(e.target.value)}
                            />
                            <button 
                                className="mt-[10px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] p-[10px] flex flex-row items-center gap-[10px] h-[50px] hover:bg-[#3C4061] transition-colors duration-200"
                                onClick={handleValidation}
                            >
                                <p className="text-[16px] font-medium">Assume Role 검증</p>
                            </button>
                        </div>
                        {validationStatus === 'success' && (
                            <p className="mt-[10px] text-[16px] font-medium text-[#90EE90]">완료</p>
                        )}
                        {validationStatus === 'fail' && (
                            <p className="mt-[10px] text-[16px] font-medium text-[#FF7F7F]">실패</p>
                        )}
                    </div>
                </BigCard>
            </div>
        </>
    )
}
