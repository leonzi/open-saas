FROM node:20-bookworm AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN curl -sSL https://get.wasp.sh/installer.sh | sh

COPY . .
RUN npm ci
RUN wasp build

WORKDIR /app/.wasp/build/server
RUN npm ci
RUN npx prisma generate

FROM node:20-bookworm AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.wasp/build/server /app

EXPOSE 3000
CMD sh -c "npx prisma migrate deploy && node dist/index.js"
