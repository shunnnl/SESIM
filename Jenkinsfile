pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'sesim/springboot-app'
        DOCKER_CONTAINER_NAME = 'sesim-backend-container'

        BE_SERVER_1 = 'k12s109.p.ssafy.io'
        BE_SERVER_2 = '3.34.198.223'

        DEPLOY_KEY_1 = '/var/jenkins_home/.ssh/K12S109T.pem'
        DEPLOY_KEY_2 = '/var/jenkins_home/.ssh/sesim-saas-key-pair.pem'

        APP_DIR = '/home/ubuntu/sesim'
    }

    options {
        skipDefaultCheckout true
    }

    stages {
        stage('Check Branch') {
            when {
                expression {
                    env.BRANCH_NAME == 'be'
                }
            }
            steps {
                echo "✅ 브랜치 이름 확인: ${env.BRANCH_NAME} → 백엔드 배포 진행"
            }
        }

        stage('Clone BE Branch') {
            when {
                expression {
                    env.BRANCH_NAME == 'be'
                }
            }
            steps {
                git branch: 'be',
                    url: 'https://lab.ssafy.com/s12-final/S12P31S109.git',
                    credentialsId: 'sesim-gitlab'
            }
        }

        stage('Build with Gradle') {
            when {
                expression {
                    env.BRANCH_NAME == 'be'
                }
            }
            steps {
                dir('be/sesim') {
                    echo '🪄 Gradle 빌드 시작'
                    sh '''
                        if [ ! -x gradlew ]; then
                            chmod +x gradlew
                        fi
                        ./gradlew clean build -x test
                    '''
                }
            }
        }

        stage('Docker Build & Deploy') {
            when {
                expression {
                    env.BRANCH_NAME == 'be'
                }
            }
            steps {
                dir('be/sesim') {
                    withCredentials([
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'MAIL_PASSWORD', variable: 'MAIL_PASSWORD'),
                        string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                        string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY'),
                        string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_KEY'),
                        string(credentialsId: 'SAAS_AWS_ACCESS_KEY', variable: 'SAAS_AWS_ACCESS_KEY'),
                        string(credentialsId: 'SAAS_AWS_SECRET_KEY', variable: 'SAAS_AWS_SECRET_KEY')
                    ]) {
                        sh '''
                            echo 'Docker 이미지 빌드 중...'
                            docker build -t ${DOCKER_IMAGE_NAME} .
                            docker save ${DOCKER_IMAGE_NAME} > backend_image.tar

                            ##################################
                            echo "🚀 BE_SERVER_1 배포 시작: ${BE_SERVER_1}"
                            ##################################
                            ssh -i ${DEPLOY_KEY_1} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_1} "rm -f ${APP_DIR}/backend_image.tar"
                            scp -i ${DEPLOY_KEY_1} -o StrictHostKeyChecking=no backend_image.tar ubuntu@${BE_SERVER_1}:${APP_DIR}
                            ssh -i ${DEPLOY_KEY_1} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_1} "
                                docker stop '${DOCKER_CONTAINER_NAME}' || true
                                docker rm '${DOCKER_CONTAINER_NAME}' || true
                                docker rmi -f '${DOCKER_IMAGE_NAME}' || true
                                docker load < '${APP_DIR}/backend_image.tar'
                                docker run -d --name '${DOCKER_CONTAINER_NAME}' -p 8080:8080 \
                                -e DB_URL='jdbc:mysql://${BE_SERVER_1}:6033/sesim' \
                                -e DB_USERNAME='sesim' \
                                -e DB_PASSWORD='${DB_PASSWORD}' \
                                -e MAIL_USERNAME='siyun2072@gmail.com' \
                                -e MAIL_PASSWORD='${MAIL_PASSWORD}' \
                                -e JWT_SECRET='${JWT_SECRET}' \
                                -e AWS_ACCESS_KEY='${AWS_ACCESS_KEY}' \
                                -e AWS_SECRET_KEY='${AWS_SECRET_KEY}' \
                                -e SAAS_AWS_ACCESS_KEY='${SAAS_AWS_ACCESS_KEY}' \
                                -e SAAS_AWS_SECRET_KEY='${SAAS_AWS_SECRET_KEY}' \
                                '${DOCKER_IMAGE_NAME}'
                            "
                            
                            ##################################
                            echo "🚀 BE_SERVER_2 배포 시작: ${BE_SERVER_2}"
                            ##################################
                            ssh -i ${DEPLOY_KEY_2} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_2} "rm -f ${APP_DIR}/backend_image.tar"
                            scp -i ${DEPLOY_KEY_2} -o StrictHostKeyChecking=no backend_image.tar ubuntu@${BE_SERVER_2}:${APP_DIR}
                            ssh -i ${DEPLOY_KEY_2} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_2} "
                                docker stop '${DOCKER_CONTAINER_NAME}' || true
                                docker rm '${DOCKER_CONTAINER_NAME}' || true
                                docker rmi -f '${DOCKER_IMAGE_NAME}' || true
                                docker load < '${APP_DIR}/backend_image.tar'
                                docker run -d --name '${DOCKER_CONTAINER_NAME}' -p 8080:8080 \
                                -e DB_URL='jdbc:mysql://${BE_SERVER_1}:6033/sesim' \
                                -e DB_USERNAME='sesim' \
                                -e DB_PASSWORD='${DB_PASSWORD}' \
                                -e MAIL_USERNAME='siyun2072@gmail.com' \
                                -e MAIL_PASSWORD='${MAIL_PASSWORD}' \
                                -e JWT_SECRET='${JWT_SECRET}' \
                                -e AWS_ACCESS_KEY='${AWS_ACCESS_KEY}' \
                                -e AWS_SECRET_KEY='${AWS_SECRET_KEY}' \
                                -e SAAS_AWS_ACCESS_KEY='${SAAS_AWS_ACCESS_KEY}' \
                                -e SAAS_AWS_SECRET_KEY='${SAAS_AWS_SECRET_KEY}' \
                                '${DOCKER_IMAGE_NAME}'
                            "

                            echo "🧹 로컬 tar 파일 삭제"
                            rm -f backend_image.tar
                        '''
                    }
                }
            }
        }
    }

    post {
        failure {
            echo '❌ 백엔드 빌드 또는 배포 실패!'

            script {
                def reason = currentBuild.getLog(10).collect { it.replaceAll('"', '\\"') }.join("\\n")
                sh """
                curl -X POST -H 'Content-Type: application/json' \
                -d '{
                    "username": ":jenkins7: 세심 Jenkins 봇",
                    "icon_emoji": ":jenkins7:",
                    "attachments": [
                        {
                            "fallback": ":jenkins7: 백엔드 배포 실패!",
                            "color": "#ff4444",
                            "title": ":jenkins7: 긴급속보: 배포에 실패했습니다. 🔥",
                            "text": "**🧨 브랜치**: \`${env.BRANCH_NAME}\`\\n**💥 빌드 번호**: #${env.BUILD_NUMBER}\\n**🧪 로그 요약**:\\n\`\`\`${reason}\`\`\`\\n\\n> \"누군가... Jenkins를... 말려줘...\" 😱\\n\\n[🔧 Jenkins로 디버깅](${env.BUILD_URL})"
                        }
                    ]
                }' https://meeting.ssafy.com/hooks/1wgxo7nc9td3zeedzh49yc61or
                """
            }
        }
        success {
            echo '✅ 백엔드 빌드 및 배포 성공!'

            sh '''
            curl -X POST -H 'Content-Type: application/json' \
            -d '{
                "username": "Jenkins 배포 봇",
                "icon_url": "https://img.icons8.com/fluency/48/server.png",
                "attachments": [
                    {
                        "fallback": ":jenkins7: 백엔드 배포 성공!",
                        "color": "#00C851",
                        "title": ":jenkins7: 배포 성공의 기쁨이 세심을 감쌌습니다! 🎉",
                        "text": "**👨‍💻 브랜치**: \`${env.BRANCH_NAME}\`\\n**📦 서버**: ${env.BE_SERVER_1}, ${env.BE_SERVER_2}\\n**🛠️ 빌드 번호**: #${env.BUILD_NUMBER}\\n\\n> \"이제 여러분은 새로운 기능을 누릴 수 있습니다.\"\\n\\n[🔗 Jenkins 보러가기](${env.BUILD_URL})"
                    }
                ]
            }' https://meeting.ssafy.com/hooks/1wgxo7nc9td3zeedzh49yc61or
            '''
        }
    }
}
