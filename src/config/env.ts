import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env para dentro do process.env
// Sem essa linha, as variáveis do .env não estariam disponíveis no código
dotenv.config();

// Centralizamos todas as variáveis de ambiente aqui
// Assim, em vez de espalhar process.env por todo o código, importamos esse objeto
export const env = {
  // Porta onde o servidor vai escutar — padrão 3000 se não definida
  PORT: process.env.PORT || 3000,

  // Ambiente atual: "development" (local) ou "production" (servidor)
  NODE_ENV: process.env.NODE_ENV || 'development',

  // URL de conexão com o banco de dados PostgreSQL
  // Formato: postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Chave secreta usada para assinar e verificar tokens JWT
  // Em produção, deve ser uma string longa e aleatória — nunca exposta publicamente
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',

  // Tempo de expiração do token — "7d" significa 7 dias
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Origens permitidas para fazer requisições à API (CORS)
  // Em desenvolvimento, é o endereço do frontend Angular
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:4200',
};
