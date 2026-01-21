# =========================
# Builder stage
# =========================
FROM node:22-bookworm AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Wasp 0.20.1
RUN curl -sSL https://get.wasp.sh/installer.sh | sh -s -- -v 0.20.1
ENV PATH="/root/.local/bin:${PATH}"

COPY . .

# Wasp project root (has main.wasp + package.json we patched)
WORKDIR /app/template/app

# Build (generates .wasp/build + .wasp/out/sdk/wasp)
RUN wasp build

# Install server deps
WORKDIR /app/template/app/.wasp/build/server
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
