FROM node:20-alpine

WORKDIR /app

# Instala OpenSSL e outras dependências necessárias
RUN apk add --no-cache openssl openssl-dev

# Instala dependências primeiro
COPY package*.json ./
RUN npm install

# Copia arquivos do Prisma e gera o cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o resto dos arquivos
COPY . .

# Limpa o cache do Next.js
RUN rm -rf .next

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
