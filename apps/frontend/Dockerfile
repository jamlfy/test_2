FROM node:22-alpine AS builder
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build:front

FROM nginx:alpine AS runner
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
