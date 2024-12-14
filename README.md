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
