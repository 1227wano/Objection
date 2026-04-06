# ⚖️ 이의있음! (Objection!)

### 음식점 소상공인 행정심판 AI 보조 서비스

*행정처분을 받은 음식점 사장님, 법을 몰라도 괜찮습니다. AI가 처음부터 끝까지 함께합니다.*

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [멀티 에이전트 AI 구성](#-멀티-에이전트-ai-구성)
- [ERD](#-erd)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 화면](#-주요-화면)
- [데이터 파이프라인](#-데이터-파이프라인)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)
- [팀 소개](#-팀-소개)
- [참고 자료](#-참고-자료)

---

## 🎯 프로젝트 소개

### 왜 이의있음! 인가?

> "행정처분을 받은 4명 중 1명은 뒤집을 수 있는 처분입니다."

2025년 상반기 기준 행정심판 인용률은 **27.4%**, 시도 행정심판위원회 연평균 인용률은 **34.6%** 에 달합니다. 그러나 대부분의 음식점 소상공인은 법률 지식 부재, 비용 부담, 서류 작성 능력 부족으로 인해 대응을 포기합니다.

**이의있음!** 은 AI 멀티 에이전트 시스템을 활용하여 행정심판의 전 과정(처분서 분석 → 법적 쟁점 도출 → 유사 판례 검색 → 청구서 자동 작성 → 답변서 반박 → 재결서 해석)을 **무료로, 처음부터 끝까지** 지원합니다.

### 핵심 가치

- ⚡ **골든타임 사수**: 접속 즉시 잔여 청구기간(90일/180일) 자동 계산 및 D-Day 알림
- 🧠 **멀티 에이전트 AI**: 5개의 전문화된 AI 에이전트가 역할을 분담하여 법률 서류 품질 극대화
- 📊 **7,000건 판례 RAG**: Hadoop HDFS + Vector DB 기반 유사 판례 실시간 검색
- 📝 **자동 서류 생성**: 행정심판 청구서, 집행정지 신청서, 보충서면 자동 작성
- 🔍 **법령 버전 관리**: 처분일 당시 법령을 자동 매칭하여 법령 오적용 탐지
- 💰 **완전 무료**: 변호사 선임 비용 없이 A to Z 지원

### 시장 배경

| 지표 | 수치 | 출처 |
| --- | --- | --- |
| 2025년 상반기 행정심판 인용률 | **27.4%** | 국민권익위 |
| 시도 행심위 연평균 인용률 | **34.6%** | 법률신문 |
| 2024년 폐업 사업자 수 | **100만 8,282명** (역대 최초 100만 돌파) | 코리아비즈리뷰 |
| 음식점업 폐업률 | **15.7%** (업종 중 최상위권) | 한국은행 |
| 소상공인 부채 보유율 / 평균 부채 | 51.9% / 평균 1억 7,100만 원 | 중기부 실태조사 |

### 타겟 유저

| 항목 | 내용 |
| --- | --- |
| 타겟 | 영업정지·허가취소·과징금·영업장 폐쇄명령을 받은 음식점 사업주 |
| 연령 | 주로 40~60대 (소상공인 중 50대 34.2%, 40대 26.7%) |
| 디지털 리터러시 | 낮은 편. 법률 용어 취약, 복잡한 서식 작성 어려움 |
| 심리 상태 | 처분 직후 극도로 위축. "어차피 안 된다"는 포기 심리 |

---

## ✨ 주요 기능

### 1. 📸 처분서 분석 (1단계)

- **문서 입력**: 행정처분 통지서를 촬영(이미지), PDF 업로드, 또는 수기 입력
- **AI 추출 (A-0)**: OCR + LLM으로 처분일, 처분청, 위반 법조항, 처분 수위 자동 추출
- **D-Day 알림**: 잔여 청구기간(90일/180일) 즉시 계산
- **적법요건 판단**: 청구인 적격, 대상 적격, 청구기간 등 자동 체크

### 2. ⚖️ 법적 쟁점 분석 (2단계)

- **본안판단 AI 분석**: 4가지 쟁점 자동 분석
  - 사실오인: 처분 근거 사실이 틀렸는가
  - 법령 오적용: 잘못된 법령을 적용하지 않았는가
  - 재량권 일탈·남용: 비슷한 사건 대비 과한 처분인가
  - 절차적 하자: 사전통지·의견제출 기회 부여 등 절차 위반
- **인용 가능성 산출**: HIGH / MEDIUM / LOW 구간으로 가능성 제시
- **유사 판례 검색**: Hadoop RAG 기반 7,000건 판례에서 최적 매칭

### 3. 📝 서류 자동 생성 (3단계)

- **행정심판 청구서**: AI가 법적 논리와 판례 근거를 포함한 전문 청구서 작성
- **집행정지 신청서**: 영업정지 시 영업 지속을 위한 신청서 동시 작성
- **증거 체크리스트**: 승소에 필요한 입증 서류를 우선순위로 추천 (CCTV, 교육일지, 부채증명 등)
- **문서 검증 (Agent B)**: 작성된 서류의 오류, 누락, 논리 불일치 자동 검수

### 4. 🛡️ 답변서 분석 & 보충서면 (4~5단계)

- **답변서 분석**: 행정청 답변서의 논리적 허점 자동 포착
- **보충서면 자동 작성**: 답변서 반박 판례를 새로 검색하여 1:1 반박 구조의 보충서면 생성
- **집행정지 재신청**: 기각 시 새로운 사정을 반영한 재신청서 자동 작성

### 5. 📋 재결서 해석 (6단계)

- **재결서 분석**: 최종 결과(인용/기각/각하)를 쉬운 말로 해석
- **후속 조치 안내**: 행정소송 등 다음 단계 가이드 제공

### 6. 🔐 회원 관리

- **회원가입/로그인**: 이메일 인증 기반 가입, JWT 토큰 인증
- **비밀번호 찾기**: 이메일 인증 후 비밀번호 재설정
- **설문조사**: 사건 생성 시 처분 유형, 본인 여부 등 초기 설문

---

## 🛠 기술 스택

### Backend

| 기술 | 버전 | 용도 |
| --- | --- | --- |
| Spring Boot | 4.0.3 | 메인 백엔드 프레임워크 |
| Java | 21 | 백엔드 언어 |
| PostgreSQL | - | 주 데이터베이스 (JSONB 지원) |
| Redis | - | 캐싱, 세션 관리 |
| Spring Security + JWT | - | 인증/인가 |
| Spring Cloud OpenFeign | - | AI 서버 API 통신 |
| Spring Mail | - | 이메일 인증, 비밀번호 찾기 |
| AWS S3 | - | 파일 업로드 저장소 |

**선택 이유:**
- **Spring Boot 4.0**: 최신 LTS, 가상 스레드 지원으로 AI 파이프라인 비동기 처리에 적합
- **PostgreSQL**: JSONB 타입으로 AI 분석 결과를 유연하게 저장, pgvector 확장으로 임베딩 벡터 저장
- **OpenFeign**: AI 서버와의 마이크로서비스 통신을 선언적으로 구현

### AI / Data

| 기술 | 용도 |
| --- | --- |
| GPT-5 (A-0, A-3) | OCR 문서 추출, 법률 문서 작성 |
| Claude Sonnet 4.5 (A-1, A-2, B) | 법리 분석, 판례 전략, 문서 검증 |
| FastAPI | 역할별 AI Agent 및 오케스트레이션 구조 |
| Hadoop HDFS | 판례 원본 데이터 저장 (빅데이터 레이크) |
| PySpark + YARN | 판례 데이터 분산 처리 (중복제거, 정제) |
| Vector DB | 판례 임베딩 저장 및 RAG 검색 |
| GMS API (GPT-4.1-mini) | 법령명 정제 (Refine Step 1) |
| 법제처 API | 법령 데이터 수집, 조문 조회 |

### Frontend

| 기술 | 용도 |
| --- | --- |
| Next.js | React 기반 풀스택 프레임워크 (SSR/SSG) |
| TypeScript | 프론트엔드 언어 |
| pnpm | 패키지 매니저 (workspace 지원) |
| shadcn/ui | UI 컴포넌트 라이브러리 |
| Tailwind CSS (PostCSS) | 유틸리티 CSS 프레임워크 |
| ESLint + Prettier | 코드 린팅 및 포맷팅 |

**선택 이유:**
- **Next.js**: SSR을 통한 SEO 최적화, API Routes로 BFF 패턴 구현 용이, 법률 서비스 특성상 초기 로딩 속도 중요
- **pnpm**: npm 대비 디스크 공간 절약 및 빠른 설치, workspace 모노레포 지원
- **shadcn/ui**: 커스터마이징 가능한 접근성 우수 컴포넌트, 디지털 리터러시가 낮은 타겟 유저에게 적합

### Infrastructure

| 기술 | 용도 |
| --- | --- |
| Docker | 컨테이너화 |
| Jenkins | CI/CD 파이프라인 |
| Nginx | 리버스 프록시, SSL |
| AWS EC2 | 클라우드 배포 |
| AWS S3 | 파일 스토리지 |

### Development Tools

| 도구 | 용도 |
| --- | --- |
| Gradle 8.x | 빌드 도구 |
| Swagger (springdoc-openapi) | API 문서화 |
| Git / GitLab | 버전 관리 |
| Jira | 이슈 트래킹 |
| Notion / Discord | 커뮤니케이션 |

---

## 🏗 시스템 아키텍처

### 전체 구조도

```
                        [Client]
                    Next.js (TypeScript)
                           │
                        HTTPS
                           │
                     [Nginx :443]
                     /     |     \
                    /      |      \
          [FE :3000]  [BE :8080]  [AI Server]
           Next.js    Spring Boot  Agent Server
                        |    \          |
                   ┌────┘     └────┐    |
                   |               |    |
            [PostgreSQL] [Redis]   └────┤
             - users     - Session      |
             - cases     - Cache   [OpenFeign]
             - gov_docs  - Token     API 통신
             - analysis                 |
             - gen_docs            [AI Agents]
             - evidence            - A-0 (문서추출)
             - precedents          - A-1 (법리분석)
                                   - A-2 (전략/판례)
                   |               - A-3 (문서작성)
              ┌────┼────┐          - B   (검증)
              |    |    |
        [Hadoop] [Spark] [Vector DB]
        HDFS     - 중복   - 임베딩
        - 판례    제거    - RAG
          7K건  - 정제   - 하이브리드
        - 법령               검색
        - 크롤링

        [법제처 API]  [AWS S3]
        - 조문 조회   - 파일 업로드
        - 판례 수집   - 문서 저장
```

### 데이터 플로우

#### 1. 사용자 인증 플로우

```
Client → Spring Boot (POST /api/auth/login) → PostgreSQL (User 검증)
→ JWT Access Token 발급 (24시간)
→ Refresh Token 발급 (7일) → Redis 저장
→ Client (Token 반환)
```

#### 2. 사건 분석 파이프라인

```
Client → 처분서 업로드 → S3 저장 → A-0 (문서 추출)
→ A-1 (법적 쟁점 분석) → Vector DB (판례 임베딩 검색)
→ A-2 (전략/판례 매칭) → A-3 (청구서 초안 작성)
→ Agent B (교차 검증) → 최종 문서 → Client
```

#### 3. 답변서 반박 플로우

```
Client → 답변서 업로드 → A-0 (답변서 추출)
→ A-1 (허점 분석) → A-2 (반격 판례 검색)
→ A-3 (보충서면 작성) → Agent B (검증)
→ Client (보충서면 완성)
```

---

## 🤖 모듈형 AI 오케스트레이션 구성

단일 모델이 모든 것을 판단하지 않습니다. **역할을 철저히 분리하여 AI가 할 일과 시스템 로직이 할 일을 구분**하는 것이 이 서비스의 기술적 핵심입니다.
각 Agent는 FastAPI 기반 엔드포인트와 서비스 계층으로 분리되어 있으며, 단계 간 연결이 필요한 구간은 오케스트레이터가 조합합니다.

### 에이전트 구성

| 에이전트 | 별칭 | 전담 모델 | 핵심 임무 |
| --- | --- | --- | --- |
| **A-0** | 눈 (The Eye) | GPT-5 | 처분서/답변서/재결서 OCR 및 데이터 추출 |
| **A-1** | 뇌 (The Brain) | Sonnet 4.5 | 청구기한 계산, 적법요건 체크, 법리 분석, 논리적 허점 포착 |
| **A-2** | 사냥꾼 (Hunter) | Sonnet 4.5 | Hadoop RAG 기반 7,000건 판례 검색, 반격 시나리오 구성 |
| **A-3** | 손 (The Pen) | GPT-5 | 청구서, 보충서면 등 위원회를 설득할 고품격 법률 문서 작성 |
| **B** | 감시관 (Auditor) | Sonnet 4.5 | A-3 작성 서류의 오타, 법령 오기재, 논리 결함 교차 검토 |

### 7단계 AI 오케스트레이션 프로세스

```
1단계: A-0 → 통지서 데이터 추출, A-1 → 기한 계산
   ↓
1-1단계: A-1 → 적법요건 판단 + 집행정지 필요성 분석
   ↓
2단계: A-1 → 핵심 쟁점 추출, A-2 → 판례 검색 + 전략 수립
   ↓
3단계: A-3 → 청구서 작성, B → 검증
   ↓
4단계: A-0 → 답변서 추출
   ↓
5단계: A-1 → 허점 분석, A-2 → 반격 판례, A-3 → 보충서면, B → 검증
   ↓
6단계: A-0 → 재결서 추출, A-1 → 결과 해석
```

---

## 📊 ERD

```
┌─────────────┐1    N┌─────────────────┐1    N┌──────────────────┐
│   users     │─────▶│     cases       │─────▶│  gov_documents   │
├─────────────┤      ├─────────────────┤      ├──────────────────┤
│ user_no  PK │      │ case_no      PK │      │ gov_doc_no    PK │
│ user_id     │      │ user_no      FK │      │ case_no       FK │
│ user_pw     │      │ title           │      │ document_type    │
│ user_name   │      │ status          │      │ source_type      │
│ deleted_at  │      │ stay_status     │      │ file_key         │
└─────────────┘      │ sanction_type   │      │ extracted_text   │
                     │ sanction_days   │      │ parsed_json JSONB│
                     │ claim_type      │      │ fact / opinion   │
                     │ agency_name     │      └────────┬─────────┘
                     │ business_name   │               │1
                     └────────┬────────┘               │
                              │1                       │N
                              │N              ┌────────▼─────────┐
                     ┌────────▼─────────┐     │  case_analysis   │
                     │ case_embeddings  │     ├──────────────────┤
                     ├──────────────────┤     │ analysis_no   PK │
                     │ embedding_no  PK │     │ gov_doc_no    FK │
                     │ case_no       FK │     │ law_result  JSONB│
                     │ case_stage       │     │ precedent_result │
                     │ embedding_vector │     └──┬─────┬─────┬──┘
                     │          (1536)  │        │1    │1    │1
                     └──────────────────┘        │     │     │
                         ┌──────────────────────┘     │     └──────────────────┐
                         │N                           │1                       │N
                ┌────────▼─────────┐        ┌────────▼─────────┐    ┌─────────▼────────────┐
                │evidence_documents│        │  gen_documents   │    │case_precedent_matches│
                ├──────────────────┤        ├──────────────────┤    ├──────────────────────┤
                │ evidence_id   PK │        │ analysis_no PK/FK│    │ match_no          PK │
                │ analysis_no   FK │        │ document_type    │    │ analysis_no       FK │
                │ evidence_type    │        │ content_json     │    │ precedent_no      FK │──┐
                │ submitted        │        │          JSONB   │    │ similarity_score     │  │
                │ checked_at       │        └──────────────────┘    │ match_reason         │  │
                └──────────────────┘                                └──────────────────────┘  │
                                                                                              │
                ┌─────────────────┐1    N┌──────────────────┐                                 │
                │   Precedents    │─────▶│Precedent_vectors │           FK 참조               │
                ├─────────────────┤      ├──────────────────┤◀─────────────────────────────────┘
                │ precedent_no PK │      │ vector_no     PK │
                │ precedent_name  │      │ precedent_no  FK │
                │ precedent_code  │      │ vector_text      │
                │ precedent_date  │      │ vector_data(1536)│
                └─────────────────┘      └──────────────────┘

                ┌─────────────────┐1    N┌──────────────────┐
                │      Laws       │─────▶│  Law_Provisions  │
                ├─────────────────┤      ├──────────────────┤
                │ law_no       PK │      │ provision_no  PK │
                │ law_name        │      │ law_no        FK │
                │ law_type        │      │ article_no       │
                │ effective_at    │      │ provision_text   │
                └─────────────────┘      └──────────────────┘
```

---

## 🚀 시작하기

### Prerequisites

- **Java 21+** ([다운로드](https://www.oracle.com/java/technologies/downloads/))
- **Node.js 18+** ([다운로드](https://nodejs.org/))
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** ([다운로드](https://www.postgresql.org/download/))
- **Redis** ([다운로드](https://redis.io/download))
- **Docker** (선택, [다운로드](https://www.docker.com/products/docker-desktop))

### 환경 변수 설정

```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/objection
DB_USERNAME=postgres
DB_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-256-bit-secret

# Email (SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# AWS S3
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 실행

```bash
# 1. 저장소 클론
git clone https://lab.ssafy.com/s14-bigdata-dist-sub1/S14P21A102.git
cd S14P21A102

# 2. 백엔드 실행
cd backend
./gradlew bootRun

# 3. 프론트엔드 실행 (새 터미널)
cd frontend
pnpm install
pnpm dev
```

### 접속

| 서비스 | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## 📚 API 문서

### 인증 방법

모든 API는 JWT 토큰 기반 인증을 사용합니다.

```bash
# 1. 로그인
POST /api/auth/login
Content-Type: application/json

{
  "userId": "user@example.com",
  "userPw": "password123"
}

# Response
{
  "status": "SUCCESS",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400
  }
}

# 2. API 요청 시 헤더에 토큰 포함
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 주요 API 엔드포인트

#### 인증 (Auth)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/logout` | 로그아웃 |
| POST | `/api/auth/refresh` | 토큰 재발급 |
| GET | `/api/auth/validate` | 토큰 검증 (로그인 유지) |
| DELETE | `/api/user` | 회원 탈퇴 (소프트 딜리트) |

#### 이메일 인증

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/email/send` | 인증 코드 발송 |
| POST | `/api/email/verify` | 인증 코드 확인 |

#### 비밀번호

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/password/reset` | 비밀번호 찾기 (임시 비밀번호 발급) |
| PATCH | `/api/password/change` | 비밀번호 변경 |

#### 사건 관리 (Cases)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/cases` | 사건 생성 |
| GET | `/api/cases` | 사건 목록 조회 |
| GET | `/api/cases/{caseNo}` | 사건 상세 조회 |
| PATCH | `/api/cases/{caseNo}` | 사건 제목 수정 |
| GET | `/api/cases/{caseNo}/status` | 사건 상태 조회 |
| POST | `/api/cases/{caseNo}/survey` | 설문조사 저장 |

#### 문서 업로드 (Gov Documents)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/cases/{caseNo}/documents` | 처분서/답변서/재결서 업로드 |
| GET | `/api/cases/{caseNo}/documents/{govDocNo}` | 문서 상세 조회 |

#### 사건 경위 (Narrative)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/cases/{caseNo}/narrative` | 사건 경위 저장 |
| GET | `/api/cases/{caseNo}/narrative` | 사건 경위 조회 |

#### AI 분석 (Analysis)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/cases/{caseNo}/analysis` | AI 사건 분석 요청 |
| GET | `/api/analysis/{analysisNo}/legal` | 적법요건 판단 결과 조회 |
| GET | `/api/analysis/{analysisNo}/merit` | 본안판단 결과 조회 |
| GET | `/api/analysis/{analysisNo}/precedents` | 유사 판례 조회 |

#### 증거 관리 (Evidence)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/api/analysis/{analysisNo}/evidence` | 증거 목록 조회 |
| PATCH | `/api/analysis/{analysisNo}/evidence/{evidenceId}` | 증거 제출 여부 업데이트 |

#### 생성 문서 (Gen Documents)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/api/analysis/{analysisNo}/documents` | 생성 문서 조회 (청구서/보충서면) |
| POST | `/api/analysis/{analysisNo}/documents` | 문서 생성 요청 |
| PATCH | `/api/analysis/{analysisNo}/documents` | 문서 수정 |
| GET | `/api/analysis/{analysisNo}/documents/download` | 문서 다운로드 |

### 공통 응답 형식

```json
{
  "status": "SUCCESS",    // SUCCESS / FAIL / ERROR
  "message": "요청이 성공했습니다.",
  "data": { ... }
}
```

### 공통 에러 코드

| HTTP Status | 설명 |
| --- | --- |
| 400 | 요청 파라미터 유효성 검사 실패 |
| 401 | JWT 토큰 누락, 만료, 또는 유효하지 않음 |
| 403 | 해당 리소스 접근 권한 없음 |
| 404 | 요청한 리소스가 존재하지 않음 |
| 409 | 이미 존재하는 데이터 |
| 410 | 만료된 데이터 (인증 코드 등) |
| 500 | 서버 내부 오류 (LLM, OCR 파이프라인 포함) |

### Agent API 엔드포인트

AI 서버와의 내부 통신용 API입니다.

| Method | Endpoint | Agent | 설명 |
| --- | --- | --- | --- |
| POST | `/ai/agents/document-extract` | A-0 | 문서 OCR 및 데이터 추출 |
| POST | `/ai/agents/legal-issue-analysis` | A-1 | 법적 쟁점 분석 |
| POST | `/ai/agents/strategy-precedent-analysis` | A-2 | 전략/판례 매칭 분석 |
| POST | `/ai/agents/document-draft` | A-3 | 법률 문서 초안 작성 |
| POST | `/ai/agents/document-review` | B | 문서 검증 및 교차 검토 |
| POST | `/ai/agents/text-embedding` | - | 텍스트 임베딩 생성 |

---

## 📁 프로젝트 구조

```
objection/
├── backend/                     # Spring Boot 4.0 (Java 21)
│   ├── src/main/java/com/objection/
│   │   ├── auth/                # 인증/인가
│   │   ├── cases/               # 사건 관리
│   │   ├── govdocument/         # 관공서 문서 (처분서/답변서/재결서)
│   │   ├── analysis/            # AI 분석 파이프라인
│   │   ├── gendocument/         # 생성 문서 (청구서/보충서면)
│   │   ├── evidence/            # 증거 관리
│   │   ├── narrative/           # 사건 경위
│   │   └── common/              # Security, S3, 예외처리
│   ├── build.gradle
│   └── Dockerfile
│
├── frontend/                    # Next.js (TypeScript, pnpm)
│   ├── public/
│   ├── src/
│   ├── next.config.ts
│   └── Dockerfile
│
├── ai/
│   ├── data-pipeline/           # 판례 수집/정제
│   │   ├── collect/             # 법제처 API 크롤러
│   │   ├── dedup/               # Spark 중복 제거
│   │   ├── refine/              # 법령 정제
│   │   ├── common/              # HDFS 유틸리티
│   │   └── Dockerfile
│   └── agents/                  # AI 에이전트 (A-0 ~ B)
│
└── docker-compose.yml
```

---

## 📱 주요 화면

### 1. 랜딩 페이지

![랜딩 페이지](./img/랜딩%20페이지.png)

- 서비스 슬로건 및 소개 ("초보자도 쉬운 행정심판, 당신의 든든한 AI 파트너")
- 행정심판 5단계 프로세스 시각 안내 (처분서 수령 → 청구서 작성 → 답변서 분석 → 보충서면 → 재결서)
- 핵심 기능 소개 카드 (쉬운 AI 작성 / 문서 분석 / 법률 안내)
- 로그인 · 회원가입 버튼

### 2. 로그인 · 회원가입

|회원가입|로그인|
|:---:|:---:|
|![로그인](./img/로그인%20·%20회원가입.png)|![회원가입](./img/로그인%20·%20회원가입2.png)|

- 아이디(이메일) / 비밀번호 로그인, 자동 로그인 옵션
- 회원가입 (이름, 이메일, 비밀번호) → 이메일 인증 코드 확인

### 3. 메인 대시보드 (로그인 후)

![메인페이지](./img/메인페이지.png)

- 나의 행정심판 목록 (사건 제목, 현재 단계, D-Day, 최근 업데이트)
- 새 사건 시작하기 버튼

### 4. 사건 시작 페이지

![사건 시작](./img/사건%20시작%20페이지.jpg)

- **시작 방식 선택**: 처음부터 시작 / 중간부터 시작 (단계 선택)
- **약관 동의**: 서비스 이용약관 확인
- **처분서 입력**: 처분 통지서 업로드(PDF/JPEG/PNG) 또는 수동 입력
  - 처분 '사전' 통지서 구분 안내 (사전통지서는 아직 확정 아님을 경고)
- **설문조사**: 처분 유형, 본인 여부 등

### 5. AI 분석 진행 화면

### 5. AI 분석 진행 화면

|분석 진행|분석 진행|
|:---:|:---:|
|![AI 분석 1](./img/AI%20분석%20진행%20화면.jpg)|![AI 분석 2](./img/AI%20분석%20진행%20화면2.jpg)|


### 6. 적법요건 판단 결과

![적법요건 판단 결과](./img/적법요건%20판단%20결과.png)

- 처분서 내용 요약 (처분서가 있을 경우)
- 행정심판 가능 여부 판단 (청구인 적격 / 대상 적격 / 청구기간)
- D-Day 타임라인 (청구 마감일까지 남은 일수)
- AI 법률 비서 채팅 (실시간 Q&A)

### 7. 사건 경위 작성

![사건 경위 작성](./img/사건%20경위%20작성.jpg)

- 사실관계 (육하원칙 기반 시간순 경위)
- 부당하다고 생각하는 이유 (불가피한 사정, 억울한 점)
- 사이드바 진행 상황 표시 (사건경위작성 → AI판단결과 → 체크리스트 → 문서작성 → 완료)

### 8. 본안 판단 결과 보고서

![본안 판단 결과 보고서](./img/본안%20판단%20결과%20보고서.jpg)

- AI 판단 요약 및 최적 전략 (취소심판 등)
- 쟁점별 분석 (사실오인 / 법령오적용 / 재량권일탈 / 절차적하자)
- 유사 판례 매칭 결과
- 집행정지 신청 필요 시 안내 및 작성 페이지 연결

### 9. 증거 체크리스트 & 문서 생성

|증거 체크리스트|문서 편집|문서 생성|
|:---:|:---:|:---:|
|![증거1](./img/증거%20체크리스트%20%26%20문서%20생성.jpg)|![증거2](./img/증거%20체크리스트%20%26%20문서%20생성2.jpg)|![증거3](./img/증거%20체크리스트%20%26%20문서%20생성3.jpg)|

- AI 추천 증거 목록 (제출 여부 체크)
- 청구서 / 보충서면 자동 생성 및 편집
- 문서 다운로드

### 10. 답변서 · 보충서면 · 재결서 단계

|답변서 분석|보충서면 작성|재결서 해석|
|:---:|:---:|:---:|
|![답변서1](./img/답변서%20·%20보충서면%20·%20재결서%20단계.jpg)|![답변서2](./img/답변서%20·%20보충서면%20·%20재결서%20단계2.jpg)|![답변서3](./img/답변서%20·%20보충서면%20·%20재결서%20단계3.jpg)|

- 답변서 업로드 → AI 허점 분석
- 보충서면 자동 작성 (1:1 반박 구조)
- 재결서 업로드 → 결과 해석 및 후속 조치 안내

---

## 🔄 데이터 파이프라인

### 판례 데이터 수집 및 정제

법제처 API와 크롤링으로 음식업 관련 행정심판 재결례를 수집하고, Hadoop HDFS에 저장한 뒤 **PySpark + YARN**으로 정제합니다.

```
1. Collect (수집)
   법제처 API 크롤링 (키워드: 식품접객업, 음식점, 주점, 제과점 등)
   → 본문검색 + 최신순 정렬 + 사건번호 공백 제거
   → HDFS /raw/ 에 JSONL 저장

2. Dedup (중복 제거) — PySpark + YARN 분산 처리
   → 사건번호 + 의결일자 기준 3중 중복 체크
   → HDFS /deduped/ 에 결과 저장

3. Refine (정제) — 4단계 파이프라인
   → Step 0: 처분유형 분류 (영업정지/과징금/허가취소/폐쇄명령)
   → Step 1: LLM(GMS API)으로 모호한 법령명을 정확한 법령명으로 교체
   → Step 2: 정규표현식으로 「법령명」제X조 패턴 추출
   → Step 3: 법제처 API로 해당 조문의 실제 내용을 가져와서 원문에 삽입
   → HDFS /cleaned/ 에 최종 결과 저장
```

### HDFS 데이터 저장 구조

```
/raw/precedents/          ← 과거 원본 데이터 (3,710건)
/raw/new/                 ← 크롤링 수집 신규 데이터
/deduped/                 ← Spark 중복 제거 결과
/cleaned/                 ← 정제 완료 최종 데이터
/cleaned/_index.txt       ← 처리 완료 키 인덱스
```

### 임베딩 & RAG 파이프라인

```
정제된 판례 → 섹션 분리 (처분개요/주장/판단/결론)
  → 청킹 (500~700자, 100~150자 overlap)
  → 임베딩 (1536차원 벡터)
  → Vector DB 저장 (메타데이터: 사건번호, 쟁점 태그, 증거 태그)
  → 하이브리드 검색 (BM25 + Dense Vector)
```

---

## 💻 개발 가이드

### 코드 컨벤션

#### Git Branch 전략

| 분야별 | 설명 |
| --- | --- |
| Backend | 백엔드 |
| Frontend | 프론트엔드 |
| AI | AI 에이전트/파이프라인 |

각 파트 브랜치 별로 하위 브랜치(Jira 티켓번호)를 파서 작업합니다. (master push 금지)

#### 커밋 메시지 규칙

```
<type>: <subject>
```

| 타입 | 설명 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `chore` | 빌드 설정, 패키지 매니저 설정 수정 |
| `test` | 테스트 코드 작성 및 수정 |
| `docs` | README, 주석 등 문서 수정 |
| `style` | 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음) |
| `refactor` | 코드 리팩토링 (기능 변화 없이 구조 개선) |

**예시:**

```bash
feat: 처분서 인식 기능 추가
fix: JWT 토큰 만료 시 리프레시 로직 수정
```

#### 패키지 구조 (도메인별)

```
com.objection.{domain}
├── controller      // API 엔드포인트
├── service         // 비즈니스 로직
├── repository      // DB 접근
├── dto             // Request/Response DTO
│   ├── request
│   ├── response
│   └── ai          // AI 서버 통신용 DTO (Feign Client)
├── entity          // JPA Entity
└── enums           // Enum 정의
```

---

## 🚢 배포

### Docker 배포

```bash
# Dockerfile (Java 21 기반)
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Jenkins CI/CD

GitLab push 시 자동으로 빌드 및 배포됩니다.

```
GitLab Push → Jenkins Pipeline → Docker Build → Deploy
```

### 서비스 구성

| 서비스 | 포트 | 설명 |
| --- | --- | --- |
| Nginx | 80/443 | 리버스 프록시 + SSL |
| Frontend | 3000 | Next.js 앱 |
| Backend | 8080 | Spring Boot API |
| AI Server | - | 에이전트 서버 |
| PostgreSQL | 5432 | 주 데이터베이스 |
| Redis | 6379 | 캐싱/세션 |
| Hadoop | - | 판례 데이터 저장 |

---

## 📊 Enum 정의 (상태 코드)

### 사건 상태 (CaseStatus) — 30개 상태

```
STARTED → DOC_UPLOADED → ANALYZING → ANALYSIS_DONE
→ NARRATIVE_WRITING → STRATEGY_GENERATING → STRATEGY_DONE
→ CHECKLIST_WRITING → DOC_GENERATING → DOC_GENERATED
→ APPEAL_SUBMITTED → ANSWER_RECEIVED → ANSWER_ANALYZING → ANSWER_DONE
→ SUPPLEMENT_NARRATIVE → SUPPLEMENT_GENERATING → SUPPLEMENT_STRATEGY_DONE
→ SUPPLEMENT_DOC_GENERATING → SUPPLEMENT_DONE → SUPPLEMENT_SUBMITTED
→ DECISION_RECEIVED → DECISION_ANALYZING → DECISION_DONE → COMPLETED
```

### 집행정지 상태 (StayStatus)

| 값 | 설명 |
| --- | --- |
| NONE | 미신청 |
| REQUESTED | 신청 완료 |
| GRANTED | 인용 |
| REJECTED | 기각 |

### 문서 유형

| 구분 | 값 | 설명 |
| --- | --- | --- |
| 업로드 문서 | NOTICE | 행정처분 통지서 |
| | ANSWER | 행정청 답변서 |
| | DECISION | 재결서 |
| | STAY_DECISION | 집행정지 결정서 |
| 생성 문서 | APPEAL_CLAIM | 행정심판 청구서 |
| | SUPPLEMENT_STATEMENT | 보충서면 |

---

## 👥 팀 소개

SSAFY 14기 A102팀

---

## 📚 참고 자료

### 공식 문서

- [Spring Boot 4.0 Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Apache Hadoop](https://hadoop.apache.org/)
- [Apache Spark](https://spark.apache.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### 법률 데이터

- [법제처 오픈 API](https://www.law.go.kr/LSO/main.html)
- [국민권익위원회](https://www.acrc.go.kr/)
- [행정심판법](https://www.law.go.kr/법령/행정심판법)
- [식품위생법](https://www.law.go.kr/법령/식품위생법)

### 시장 데이터

- [2025년 상반기 행정심판 인용률 27.4% — 국민권익위](https://www.acrc.go.kr/)
- [시도 행심위 연평균 인용률 34.6% — 법률신문](https://www.lawtimes.co.kr/)
- [2024년 폐업 사업자 100만 돌파 — 코리아비즈리뷰](https://www.koreabizreview.com/)

---

## ⭐️ 라이선스

이 프로젝트는 SSAFY 교육 과정의 일환으로 개발되었습니다.

---

### 🙏 감사합니다!

**법을 몰라도 괜찮습니다. AI가 처음부터 끝까지 함께합니다.**

**Made with ⚖️ by 이의있음! Team (SSAFY 14기 A102)**

[⬆ 맨 위로 이동](#-이의있음-objection)
