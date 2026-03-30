# Frontend

### Stack
언어: TypeScript
IDE: VS Code
런타임: Node.js 24
프레임워크: Next.js 16.1.4
패키지 매니저: pnpm 9.15.5
스타일: Tailwind CSS 4, Emotion (styled/react)
주요 라이브러리: React 19.2.3, shadcn, Zustand, React Hook Form, Lucide React, @react-pdf/renderer, tailwind-merge

### 
fe 디렉토리로 이동합니다. 
의존성 설치: pnpm install --frozen-lockfile
빌드: pnpm build
실행: pnpm start (Standalone 모드 사용 시 node server.js)

### .env
NEXT_PUBLIC_API_BASE_URL=http://j14a102.p.ssafy.io:8080


# Backend
# 기술 스택 및 배포 정보

## 1) 사용한 JVM, 웹서버, WAS 제품 등의 종류와 설정 값, 버전

| 구분 | 제품 | 버전 | 설정 값 |
|------|------|------|---------|
| JDK | Eclipse Temurin (OpenJDK) | 21 | `toolchain { languageVersion = JavaLanguageVersion.of(21) }` |
| 빌드 도구 | Gradle | - | `./gradlew clean build` |
| WAS | Spring Boot (내장 Tomcat) | 4.0.3 | Port: `8080` |
| Spring Cloud | Spring Cloud | 2025.1.0 | OpenFeign (AI 서버 통신) |
| DB | PostgreSQL | - | `org.postgresql.Driver`, Hibernate `ddl-auto: update` |
| 캐시 | Redis | - | Port: `6379` |
| ORM | Spring Data JPA | - | `PostgreSQLDialect`, `show-sql: true` |
| 보안 | Spring Security + JWT | jjwt `0.12.6` | Stateless 세션, BCrypt 암호화 |
| API 문서 | springdoc-openapi | 3.0.2 | Swagger UI (`/swagger-ui/**`) |
| 파일 저장 | AWS SDK S3 | 2.21.1 | 버킷: `ssafy-objection-ai-bucket`, 리전: `ap-southeast-2` |

## 2) 빌드 시 사용되는 환경 변수

```env
# DB
DB_URL=jdbc:postgresql://localhost:5432/objection
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret

# 이메일 (Gmail SMTP)
MAIL_USERNAME=your_gmail_account
MAIL_PASSWORD=your_email_app_password

# AWS S3
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
```

## 3) 배포 시 특이사항

### 도메인 및 CORS 설정
- 배포 도메인: `https://j14a102.p.ssafy.io`
- AI 서버 도메인: `https://j14a102a.p.ssafy.io`
- 허용 Origin: `http://localhost:3000`, `http://localhost:5173`, `https://j14a102.p.ssafy.io`

### JWT 토큰 설정
- Access Token 만료: `86400000ms` (24시간)
- Refresh Token 만료: `604800000ms` (7일)

### 파일 업로드 제한
- 최대 파일 크기: `50MB`
- 최대 요청 크기: `50MB`

### 인증/인가 설정
- 인증 불필요 경로: `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- 그 외 모든 요청: JWT 인증 필요
- 세션 관리: `STATELESS` (서버에 세션 저장하지 않음)

### AI 서버 연결
- 배포 시: `https://j14a102a.p.ssafy.io`
- 내부 배포 시: 내부 IP `172.26.6.90` 사용 가능 (속도 향상)

## 4) DB 접속 정보 및 프로퍼티 파일 목록

### DB 접속 정보

| 항목 | 값 |
|------|-----|
| Driver | `org.postgresql.Driver` |
| URL | `${DB_URL}` (예: `jdbc:postgresql://localhost:5432/objection`) |
| User | `${DB_USERNAME}` |
| Password | `${DB_PASSWORD}` |
| Dialect | `PostgreSQLDialect` |
| DDL 전략 | `update` (엔티티 변경 시 자동 스키마 갱신) |

### 주요 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 정보 (아이디, 비밀번호, 이름) |
| `cases` | 사건 정보 (상태, 처분일, 기관명 등) |
| `gov_documents` | 행정 문서 (처분서, 답변서, 재결서) |
| `case_analysis` | AI 분석 결과 (법적 쟁점, 전략) |
| `gen_documents` | AI 생성 문서 (청구서, 보충서면) |
| `evidence_documents` | 증거 서류 체크리스트 |
| `case_embeddings` | 사건 임베딩 벡터 (VECTOR(1536)) |
| `Law_Provisions` | 법령 조항 데이터 (VECTOR(1536)) |
| `Precedent_vectors` | 판례 벡터 데이터 |
| `case_precedent_matches` | 사건-판례 매칭 결과 |

### 프로퍼티 파일 목록

| 파일 경로 | 내용 |
|-----------|------|
| `application.yml` | Spring Boot 메인 설정 (DB, Redis, JWT, Mail, S3, AI 서버 URL) |
| `build.gradle` | 의존성 관리 (Spring Boot 4.0.3, JDK 21, Spring Cloud 2025.1.0) |

### .env
MAIL_USERNAME=objection.noreply@gmail.com
MAIL_PASSWORD=ilgjocchsecqkuip
DB_URL=jdbc:postgresql://3.36.78.186:5432/objection
DB_USERNAME=ssafy
DB_PASSWORD=ssafy
REDIS_HOST=j14a102.p.ssafy.io
REDIS_PORT=6379
REDIS_PASSWORD=obj_redis
JWT_SECRET=objection-secret-key-must-be-at-least-32-bytes-long
AWS_ACCESS_KEY=AKIASVIHG64GTRWCLDE2
AWS_SECRET_KEY=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

# Hadoop

## 서버 / 환경
- 서버: AWS2
- OS: Ubuntu 24.04
- Docker: 29.3.0
- Docker Compose: v5.1.0

## 작업 경로
- `/opt/ai-server/workspace/hadoop-yarn-cluster`

## 주요 파일
- `/opt/ai-server/workspace/hadoop-yarn-cluster/docker-compose.yml`
- `/opt/ai-server/workspace/hadoop-yarn-cluster/.env`

## .env
- `CLUSTER_NAME=ai-hadoop-cluster`

## 구성 서비스
- `namenode`
- `datanode1`
- `datanode2`
- `resourcemanager`
- `nodemanager1`
- `nodemanager2`
- `historyserver`

## 네트워크
- `hadoop`

## 볼륨
- `namenode_data`
- `datanode1_data`
- `datanode2_data`
- `historyserver_data`

## HDFS 관련 설정
- `CORE_CONF_fs_defaultFS=hdfs://namenode:8020`
- `CORE_CONF_hadoop_http_staticuser_user=root`
- `CORE_CONF_hadoop_proxyuser_hdfs_hosts=*`
- `CORE_CONF_hadoop_proxyuser_hdfs_groups=*`
- `HDFS_CONF_dfs_replication=2`
- `HDFS_CONF_dfs_namenode_datanode_registration_ip___hostname___check=false`
- `HDFS_CONF_dfs_permissions_enabled=false`

## YARN 관련 설정
- `YARN_CONF_yarn_resourcemanager_hostname=resourcemanager`
- `YARN_CONF_yarn_nodemanager_aux___services=mapreduce_shuffle`
- `YARN_CONF_yarn_log___aggregation___enable=true`
- `YARN_CONF_yarn_log_server_url=http://historyserver:8188/applicationhistory/logs/`
- `YARN_CONF_yarn_acl_enable=false`
- `YARN_CONF_yarn_resourcemanager_recovery_enabled=false`

## MapReduce / HistoryServer 관련 설정
- `MAPRED_CONF_mapreduce_framework_name=yarn`
- `MAPRED_CONF_mapreduce_map_java_opts=-Xmx512m`
- `MAPRED_CONF_mapreduce_reduce_java_opts=-Xmx512m`
- `MAPRED_CONF_mapreduce_jobhistory_address=historyserver:10020`
- `MAPRED_CONF_mapreduce_jobhistory_webapp_address=historyserver:8188`
- `MAPRED_CONF_mapreduce_jobhistory_done___dir=/mr-history/done`
- `MAPRED_CONF_mapreduce_jobhistory_intermediate___done___dir=/mr-history/tmp`

## 서비스별 현재 포트 / 바인딩
- `namenode`: `127.0.0.1:9870:9870`
- `datanode1`: 외부 publish 없음
- `datanode2`: 외부 publish 없음
- `resourcemanager`: `127.0.0.1:8088:8088`
- `nodemanager1`: 외부 publish 없음
- `nodemanager2`: 외부 publish 없음
- `historyserver`: 외부 publish 없음

## 내부 주소 / 포트
- HDFS 기본 주소: `hdfs://namenode:8020`
- NameNode UI: `9870`
- ResourceManager UI: `8088`
- HistoryServer UI: `8188`
- JobHistory Address: `historyserver:10020`

## 현재 검증 상태
- NameNode 정상
- DataNode 2대 정상 등록
- ResourceManager 정상
- NodeManager 2대 정상 등록
- HDFS put/get 정상
- replication=2 정상
- HDFS 상태 HEALTHY

## 컨테이너 내부 주요 설정 파일 경로
- `/etc/hadoop/core-site.xml`
- `/etc/hadoop/hdfs-site.xml`
- `/etc/hadoop/yarn-site.xml`
- `/etc/hadoop/mapred-site.xml`
- `/etc/hadoop/hadoop-env.sh`

# FastAPI

# FastAPI 설정 정보

## 실행 정보

- 엔트리포인트: `main.py`
- 앱 객체: `app.main:app`
- 앱 팩토리 파일: `app/main.py`
- 앱 제목: `Administrative Appeal AI API`
- 앱 버전: `0.1.0`
- 문서 URL: `/docs`
- ReDoc URL: `/redoc`
- 헬스체크: `/health`

## 실행 명령

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Docker 설정

- 베이스 이미지: `python:3.11-slim`
- 작업 디렉터리: `/app`
- 컨테이너 포트: `8000`
- 실행 명령: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

## Python 및 패키지 버전

- Python: `3.11`
- fastapi: `0.115.12`
- uvicorn[standard]: `0.34.0`
- pydantic: `2.11.2`
- httpx: `0.28.1`
- python-dotenv: `1.1.0`
- Pillow: `11.1.0`
- pdfplumber: `0.11.9`

## 환경 변수

- `GMS_KEY`
  - 현재 `.env` 설정: `설정됨`
  - 현재 값: `S14P22A102-****-****-****-************`

- `STRATEGY_MODEL`
  - 기본값: `gemini-2.5-pro`

- `DRAFT_MODEL`
  - 기본값: `gpt-5.2`

## .env 로드 경로

- `프로젝트 루트/.env`

## 주요 설정 파일

- `.env`
- `requirements.txt`
- `Dockerfile`
- `main.py`
- `app/main.py`
- `app/services/document_extract_service.py`
- `app/services/legal_issue_analysis_service.py`
- `app/services/strategy_precedent_analysis_service.py`
- `app/services/document_draft_service.py`
- `app/services/document_review_service.py`
- `app/services/text_embedding_service.py`
