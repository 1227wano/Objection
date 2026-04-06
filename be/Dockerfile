# 1. Java 21 환경을 베이스로 사용
FROM eclipse-temurin:21-jdk-alpine

# 2. 컨테이너 내부에 작업 디렉토리 생성
WORKDIR /app

# 3. Jenkins가 빌드해 준 jar 파일을 컨테이너 내부의 app.jar로 복사
COPY app.jar app.jar

# 4. 스프링 부트 실행
ENTRYPOINT ["java", "-jar", "app.jar"]