export function getToken(tokenName: string): string | undefined {
  // Ordem de prioridade:
  // 1. Variável de ambiente do processo
  // 2. Arquivo .env na raiz
  // 3. Arquivo .env.local na raiz
  // 4. Arquivo .env.development na raiz
  // 5. docker-compose.yml (através de variável de ambiente)
  
  // Verifica primeiro no process.env
  const token = process.env[tokenName];
  if (token) {
    return token;
  }

  // Se não encontrou, retorna undefined
  // O chamador deve decidir como tratar a ausência do token
  return undefined;
}

// Função específica para o token do HG Brasil
export function getHGToken(): string | undefined {
  return getToken('HG_TOKEN');
}
