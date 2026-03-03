# Usando Node 20
FROM node:22-alpine

# Diretório dentro do container
WORKDIR /app

# Copia apenas package.json primeiro (melhor cache)
COPY package*.json ./

RUN npm install

# Copia o resto do código
COPY . .

# Compila TypeScript
RUN npm run build

# Expõe porta
EXPOSE 3000

# Comando para rodar
CMD ["npm", "run", "start"]