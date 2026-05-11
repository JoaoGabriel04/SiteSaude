FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Instala tudo (incluindo dev) para gerar o prisma client
RUN npm ci

# Gera o Prisma Client separado do build
RUN npx prisma generate

COPY . .

# Compila só o TypeScript
RUN npx tsc

# Remove devDependencies após o build
RUN npm prune --omit=dev

EXPOSE 7000

CMD ["npm", "run", "start"]