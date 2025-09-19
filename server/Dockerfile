FROM node:lts-alpine AS base

FROM base AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Verify Prisma Client was generated
RUN test -d node_modules/.prisma/client || (echo "Prisma Client not found!" && exit 1)

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

COPY --chown=api:nodejs package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --chown=api:nodejs --from=build /app/dist ./dist

USER api

EXPOSE 3001

ENTRYPOINT ["npm", "run", "start"]