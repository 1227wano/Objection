# 1단계: 의존성 설치 (Deps)
FROM node:24-alpine AS deps
# Alpine 이미지에서 일부 라이브러리 호환성을 위해 추가 (필수 권장)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 패키지 매니저 설정 (Corepack 활성화로 pnpm 사용)
RUN corepack enable pnpm

# npm처럼 의존성을 끌어올려 평평하게 펼침
RUN pnpm config set node-linker hoisted
# 의존성 파일 복사 (package-lock.json 대신 pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml ./ 

# 의존성 설치 (npm ci 대신 pnpm install --frozen-lockfile 사용)
RUN pnpm install --frozen-lockfile


################################################
# 2단계: 빌드 (Builder)
FROM node:24-alpine AS builder
WORKDIR /app

# pnpm 활성화
RUN corepack enable pnpm

# 1단계에서 설치한 node_modules 가져오기
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 텔레메트리 비활성화 & 빌드 실행
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

################################################
# 3단계: 실행 (Runner)
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 보안을 위한 유저 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 공용 파일 복사
COPY --from=builder /app/public ./public

# Standalone 결과물 복사
# 권한을 nextjs 유저에게 줍니다.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 유저 변경 및 포트 설정
USER nextjs

EXPOSE 3000
ENV PORT=3000

# 실행 명령 (Standalone 모드는 node server.js로 실행)
CMD ["node", "server.js"]