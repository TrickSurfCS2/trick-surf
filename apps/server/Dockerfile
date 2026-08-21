FROM oven/bun:1.4.0-slim

WORKDIR /app

# Install openssl for Prisma runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* ./
COPY prisma ./prisma/

RUN bun install --ignore-scripts
RUN bun run prisma:generate

COPY . .

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["bun", "run", "start"]


