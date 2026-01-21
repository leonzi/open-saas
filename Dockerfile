FROM node:22-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://get.wasp.sh/installer.sh | sh -s -- -v 0.20.1
ENV PATH="/root/.local/bin:${PATH}"

COPY . .
WORKDIR /app/template/app

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["bash", "-lc", "wasp start --host 0.0.0.0 --port ${PORT}"]
