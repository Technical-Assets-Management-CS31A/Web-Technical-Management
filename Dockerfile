# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

# Vite inlines VITE_* variables at build time, so they are build args, not runtime env.
ARG VITE_API_BASE_URL
ARG VITE_ACCESS_TOKEN_KEY
ARG VITE_REFRESH_TOKEN_KEY
ARG VITE_IMAGE_BASE_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ACCESS_TOKEN_KEY=$VITE_ACCESS_TOKEN_KEY \
    VITE_REFRESH_TOKEN_KEY=$VITE_REFRESH_TOKEN_KEY \
    VITE_IMAGE_BASE_URL=$VITE_IMAGE_BASE_URL

RUN pnpm run build

# ---- Serve: static files behind nginx -------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
