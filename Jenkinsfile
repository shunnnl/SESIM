pipeline {
  agent any

  environment {
    DEPLOY_KEY = '/var/jenkins_home/.ssh/sesim-saas-key-pair.pem'
    FE_SERVER_1 = '43.201.252.136'
    FE_SERVER_2 = '13.124.60.56'
    DEPLOY_PATH = '/home/ubuntu/sesim'
    FE_PROJECT_DIR = 'fe/sesim'
    FE_PROJECT_DIR_PATH = '/jenkins-data/workspace/sesim-frontend-deploy/fe/sesim'
  }

  options {
    skipDefaultCheckout true
  }

  stages {
    stage('Clone FE Branch') {
      steps {
        git branch: 'fe',
            url: 'https://lab.ssafy.com/s12-final/S12P31S109.git',
            credentialsId: 'sesim-gitlab'
      }
    }

    stage('Install & Build in fe/sesim') {
      steps {
        dir("${FE_PROJECT_DIR}") {
          sh '''
            rm -rf dist

            npm install

            npm run build
          '''
        }
      }
    }

    stage('Deploy to Frontend Servers') {
      steps {
        sh '''
          scp -i ${DEPLOY_KEY} -o StrictHostKeyChecking=no -r ${FE_PROJECT_DIR_PATH}/dist/* ubuntu@${FE_SERVER_1}:${DEPLOY_PATH}

          scp -i ${DEPLOY_KEY} -o StrictHostKeyChecking=no -r ${FE_PROJECT_DIR_PATH}/dist/* ubuntu@${FE_SERVER_2}:${DEPLOY_PATH}

          echo "✅ 프론트 배포 완료!"
        '''
      }
    }
  }

  post {
    failure {
      echo '❌ 빌드 또는 배포 실패했습니다.'
    }
    success {
      echo '🎉 빌드 및 배포 성공!'
    }
  }
}
