FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies 
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Development
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Production build
FROM base AS production
RUN npm run build

FROM nginx:alpine AS serve
COPY --from=production /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
