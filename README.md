# Simulador "Magic Number" para Fundos Imobiliários

Este projeto é um simulador que calcula o "Magic Number" para fundos imobiliários (FIIs), permitindo aos usuários visualizarem quantas cotas são necessárias para que os rendimentos mensais sejam suficientes para comprar uma nova cota.

## Tecnologias Utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Docker
- API Brapi.dev

## Como Executar

1. Clone o repositório
2. Certifique-se de ter o Docker e Docker Compose instalados
3. Execute o comando:
   ```bash
   docker-compose up
   ```
4. Acesse http://localhost:3000

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
4. Configure suas variáveis de ambiente no arquivo `.env`:
   - `HG_TOKEN`: Seu token da API HG Brasil (obtenha em https://hgbrasil.com/status/finance)
   - `DATABASE_URL`: URL de conexão com o banco de dados

5. Execute as migrações do banco:
```bash
npx prisma migrate dev
```
6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
## Funcionalidades

- Lista de Fundos Imobiliários
- Calculadora do Magic Number
- Atualização automática de dados
- Cache para otimização de consultas
- Interface responsiva

## Estrutura do Projeto

```
efeito-bola-neve/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── prisma/
├── public/
├── docker-compose.yml
└── Dockerfile
```

## Contribuição

Contribuições são bem-vindas! Por favor, sinta-se à vontade para submeter pull requests.
