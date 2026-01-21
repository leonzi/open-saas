# =========================
# Builder stage
# =========================
FROM node:22-bookworm AS builder

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Wasp
RUN curl -sSL https://get.wasp.sh/installer.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

# Copy repo
COPY . .

# 👉 REAL Wasp project root
WORKDIR /app/template/app

# Install deps & build
RUN npm ci
RUN wasp build

# Prepare server
WORKDIR /app/template/app/.wasp/build/server
RUN npm ci
RUN npx prisma generate

# =========================
# Runtime stage
# =========================
FROM node:22-bookworm AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Copy built server only
COPY --from=builder /app/template/app/.wasp/build/server /app

EXPOSE 3000

# Apply migrations & start server
CMD sh -c "npx prisma migrate deploy && npm start"
