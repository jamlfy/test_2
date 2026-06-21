FROM node:22-alpine
WORKDIR /app

COPY . .

RUN apk add --no-cache openssl libc6-compat
RUN npm install
RUN npx -w packages/prisma prisma generate
RUN npm run build:back

COPY apps/backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "apps/backend/dist/main.js"]
