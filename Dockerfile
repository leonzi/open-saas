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

# Make wasp available in PATH
ENV PATH="/root/.local/bin:${PATH}"

# Copy repo
COPY . .

# Go into actual Wasp app directory
WORKDIR /app/opensaas-sh

# Install JS deps (required for OpenSaaS validation/build)
RUN npm ci

# Build OpenSaaS (this creates .wasp/build)
RUN wasp build

# =========================
# Prepare server
# =========================
WORKDIR /app/opensaas-sh/.wasp/build/server

RUN npm ci
RUN npx prisma generate

# =========================
# Runtime stage
# =========================
FROM node:22-bookworm AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Copy built server only
COPY --from=builder /app/opensaas-sh/.wasp/build/server /app

EXPOSE 3000

# Apply migrations & start server
CMD sh -c "npx prisma migrate deploy && npm start"
