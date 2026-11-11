# The published handbook: builds the static Storybook, then serves it with nginx on port 8080, as an unprivileged user.
# Dokploy builds this file (build type: Dockerfile) from `main` on every release. Locally: `docker build -t
# norte-handbook . && docker run --rm -p 8080:8080 norte-handbook`.

FROM node:24-slim AS build
# git: the Changelog page reads each release's date from its tag.
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Dependencies first, so a change that doesn't touch them reuses this layer. pnpm's version comes from package.json.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
RUN npm install --global "$(node -p "require('./package.json').packageManager")" && pnpm install --frozen-lockfile

COPY . .
# Dokploy clones with `--depth 1`, which leaves the tags behind. Without them the Changelog shows no dates, and the
# build still succeeds.
RUN git fetch --depth=1 --tags origin || echo "No release tags: the Changelog will show no dates."
RUN pnpm build:storybook

# nginx's official image, built to run as the `nginx` user instead of root.
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.inc /etc/nginx/conf.d/security-headers.inc
COPY --from=build /app/storybook-static /usr/share/nginx/html
EXPOSE 8080
