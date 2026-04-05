FROM node:22-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://get.wasp.sh/installer.sh | sh -s -- -v 0.20.1 \
  && ln -s /root/.local/bin/wasp /usr/local/bin/wasp

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN chmod +x /app/entrypoint.sh

WORKDIR /app/template/app

ENV NODE_ENV=development

EXPOSE 3000
EXPOSE 3001

ENTRYPOINT ["/app/entrypoint.sh"]
