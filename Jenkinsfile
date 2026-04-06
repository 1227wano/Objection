pipeline {
    // 젠킨스의 아무 작업 공간(Agent)에서나 실행하겠다는 뜻
    agent any

    // 배포에 필요한 환경 변수(이름표) 설정
    environment {
        SERVER_IP = '3.36.78.186'
        SERVER_USER = 'ubuntu'
        CREDENTIAL_ID = 'aws1-ubuntu-ssh'
        APP_NAME = 'objection-backend'
        PORT = '8080'
    }

    stages {
        // 1단계: Spring Boot 빌드 (jar 파일 굽기)
        stage('Build') {
            steps {
                dir('be') { // be 폴더로 이동해서 실행
                    sh 'chmod +x ./gradlew'
                    // 테스트는 일단 건너뛰고(-x test) 빠르게 빌드만 진행!
                    sh './gradlew clean build -x test'
                }
            }
        }

        // 2단계: 빌드된 파일 서버 1로 전송 & Docker 실행
        stage('Deploy') {
            steps {
                // sshagent 플러그인을 사용해 등록된 열쇠(Credential) 장착!
                sshagent(credentials: ["${CREDENTIAL_ID}"]) {

                    // 1. 서버 1에 deploy 폴더 만들기 (있으면 무시)
                    sh "ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} 'mkdir -p ~/deploy'"

                    // 2. 방금 구운 jar 파일과 Dockerfile을 서버 1의 deploy 폴더로 전송
                    sh "scp -o StrictHostKeyChecking=no be/build/libs/*SNAPSHOT.jar ${SERVER_USER}@${SERVER_IP}:~/deploy/app.jar"
                    sh "scp -o StrictHostKeyChecking=no be/Dockerfile ${SERVER_USER}@${SERVER_IP}:~/deploy/Dockerfile"

                    // 젠킨스에서 .env 파일 꺼내서 서버로 전송하기
                    withCredentials([file(credentialsId: 'backend-env', variable: 'SECRET_ENV_FILE')]) {
                        sh "scp -o StrictHostKeyChecking=no \$SECRET_ENV_FILE ${SERVER_USER}@${SERVER_IP}:~/deploy/.env"
                    }

                    // 3. 서버 1에 접속해서 기존 컨테이너 끄고, 새 이미지 구워서 실행!
                    sh """
                        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} '
                            cd ~/deploy
                            docker stop ${APP_NAME} || true
                            docker rm ${APP_NAME} || true
                            docker rmi ${APP_NAME}:latest || true
                            docker build -t ${APP_NAME}:latest .
                            docker run -d -p ${PORT}:${PORT} --name ${APP_NAME} --env-file .env ${APP_NAME}:latest
                        '
                    """
                }
            }
        }
    }
}