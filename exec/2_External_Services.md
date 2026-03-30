# 프로젝트에서 사용하는 외부 서비스 정보

## Gmail SMTP (이메일 인증)

| 항목 | 내용 |
|------|------|
| 서비스 | Google Gmail SMTP |
| 용도 | 회원가입·비밀번호 찾기 이메일 인증 코드 발송 |
| 설정 | Gmail 계정에서 앱 비밀번호 발급 필요 |
| 필요 키 | `MAIL_USERNAME` (Gmail 계정), `MAIL_PASSWORD` (앱 비밀번호) |
| SMTP 설정 | Host: `smtp.gmail.com`, Port: `587`, STARTTLS 활성화 |

## AWS S3 (파일 저장소)

| 항목 | 내용 |
|------|------|
| 서비스 | Amazon S3 |
| 용도 | 처분서·답변서·재결서 등 사건 관련 문서 파일 업로드 및 저장 |
| 버킷 | `ssafy-objection-ai-bucket` |
| 리전 | `ap-southeast-2` (시드니) |
| 필요 키 | `AWS_ACCESS_KEY`, `AWS_SECRET_KEY` |
| 파일 경로 규칙 | `cases/{caseNo}/{UUID}.{확장자}` |
| 비고 | MinIO 등 커스텀 엔드포인트 설정 가능 (`cloud.aws.s3.endpoint`) |

## AI 서버 (문서 분석 / 법적 쟁점 분석 / 문서 작성)

| 항목 | 내용 |
|------|------|
| 서비스 | 자체 AI 서버 (FastAPI 기반 추정) |
| 용도 | 처분서 OCR 추출, 법적 쟁점 분석, 전략·판례 매칭, 청구서·보충서면 자동 작성, 임베딩 생성 |
| 통신 방식 | Spring Cloud OpenFeign (HTTP REST) |
| 서버 URL | `https://j14a102a.p.ssafy.io` (배포), `http://localhost:8000` (로컬) |
| 환경 변수 | `ai-server.url` (application.yml) |
| 주요 엔드포인트 | `/ai/agents/document-extract`, `/ai/agents/legal-issue-analysis`, `/ai/agents/strategy-precedent-analysis`, `/ai/agents/document-draft`, `/ai/agents/document-review`, `/ai/agents/text-embedding` |

## Redis (캐시 / 인증 코드 저장)

| 항목 | 내용 |
|------|------|
| 서비스 | Redis |
| 용도 | 이메일 인증 코드 임시 저장 (TTL 5분), Refresh Token 관리 |
| 필요 키 | `REDIS_HOST` (기본값: `localhost`), `REDIS_PORT` (기본값: `6379`), `REDIS_PASSWORD` |
