FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY server/package.json server/package-lock.json* ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY server/src ./src
COPY server/tsconfig.json ./

# Development
FROM base AS development
CMD ["npm", "run", "dev"]

# Production build
FROM base AS production
RUN npm run build
RUN npm prune --production
CMD ["npm", "start"]
