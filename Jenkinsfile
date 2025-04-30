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
        stage('Clone BE Branch') {
            steps {
                git branch: 'be',
                    url: 'https://lab.ssafy.com/s12-final/S12P31S109.git',
                    credentialsId: 'sesim-gitlab'
            }
        }

        stage('Build with Gradle') {
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
            steps {
                dir('be/sesim') {
                    withCredentials([
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'MAIL_PASSWORD', variable: 'MAIL_PASSWORD'),
                        string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
                    ]) {
                        sh '''
                            set -e
                            docker build -t ${DOCKER_IMAGE_NAME} .
                            docker save ${DOCKER_IMAGE_NAME} > backend_image.tar

                            ##################################
                            echo "🚀 배포 대상: ${BE_SERVER_1}"
                            ##################################
                            ssh -i ${DEPLOY_KEY_1} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_1} "rm -f ${APP_DIR}/backend_image.tar"
                            scp -i ${DEPLOY_KEY_1} -o StrictHostKeyChecking=no backend_image.tar ubuntu@${BE_SERVER_1}:${APP_DIR}
                            ssh -i ${DEPLOY_KEY_1} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_1} << 'EOF'
                                docker stop ${DOCKER_CONTAINER_NAME} || true
                                docker rm ${DOCKER_CONTAINER_NAME} || true
                                docker rmi -f ${DOCKER_IMAGE_NAME} || true
                                docker load < ${APP_DIR}/backend_image.tar
                                docker run -d --name ${DOCKER_CONTAINER_NAME} -p 8080:8080 \
                                -e DB_URL=jdbc:mysql://${BE_SERVER_1}:6033/sesim \
                                -e DB_USERNAME=sesim \
                                -e DB_PASSWORD=$DB_PASSWORD \
                                -e MAIL_USERNAME=siyun2072@gmail.com \
                                -e MAIL_PASSWORD=$MAIL_PASSWORD \
                                -e JWT_SECRET=$JWT_SECRET \
                                ${DOCKER_IMAGE_NAME}
                            EOF
                            
                            ##################################
                            echo "🚀 배포 대상: ${BE_SERVER_2}"
                            ##################################
                            ssh -i ${DEPLOY_KEY_2} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_2} "rm -f ${APP_DIR}/backend_image.tar"
                            scp -i ${DEPLOY_KEY_2} -o StrictHostKeyChecking=no backend_image.tar ubuntu@${BE_SERVER_2}:${APP_DIR}
                            ssh -i ${DEPLOY_KEY_2} -o StrictHostKeyChecking=no ubuntu@${BE_SERVER_2} << 'EOF'
                                docker stop ${DOCKER_CONTAINER_NAME} || true
                                docker rm ${DOCKER_CONTAINER_NAME} || true
                                docker rmi -f ${DOCKER_IMAGE_NAME} || true
                                docker load < ${APP_DIR}/backend_image.tar
                                docker run -d --name ${DOCKER_CONTAINER_NAME} -p 8080:8080 \
                                -e DB_URL=jdbc:mysql://${BE_SERVER_2}:6033/sesim \
                                -e DB_USERNAME=sesim \
                                -e DB_PASSWORD=$DB_PASSWORD \
                                -e MAIL_USERNAME=siyun2072@gmail.com \
                                -e MAIL_PASSWORD=$MAIL_PASSWORD \
                                -e JWT_SECRET=$JWT_SECRET \
                                ${DOCKER_IMAGE_NAME}
                            EOF

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
        }
        success {
            echo '✅ 백엔드 빌드 및 배포 성공!'
        }
    }
}
