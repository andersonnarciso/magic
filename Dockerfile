# Use a imagem oficial do Node.js como base
FROM node:20-alpine

# Instala dependências necessárias
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    openssl-dev \
    postgresql-client \
    netcat-openbsd

# Define o diretório de trabalho
WORKDIR /app

# Instala o pnpm globalmente
RUN npm install -g pnpm

# Copia os arquivos de configuração do projeto
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY .env ./
COPY prisma ./prisma/

# Instala as dependências
RUN pnpm install

# Gera o cliente Prisma
RUN pnpm prisma generate

# Copia o resto dos arquivos do projeto
COPY . .

# Torna o script de entrada executável
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expõe a porta 3000
EXPOSE 3000

# Define o script de entrada como ponto de entrada
ENTRYPOINT ["docker-entrypoint.sh"]
