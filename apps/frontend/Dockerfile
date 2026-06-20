FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build -w apps/frontend

FROM nginx:alpine
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
