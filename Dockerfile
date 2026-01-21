# =========================
# Builder stage
# =========================
FROM node:22-bookworm AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://get.wasp.sh/installer.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

COPY . .

# 👉 REAL Wasp project root
WORKDIR /app/template/app

# No package-lock.json here, so use npm install (not npm ci)
RUN npm install --no-audit --no-fund
RUN wasp build

# Prepare server
WORKDIR /app/template/app/.wasp/build/server

# This folder might also not have a lockfile, so use npm install
RUN npm install --no-audit --no-fund
RUN npx prisma generate

# =========================
# Runtime stage
# =========================
FROM node:22-bookworm AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/template/app/.wasp/build/server /app

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && npm start"
