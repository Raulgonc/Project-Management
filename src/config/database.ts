import { PrismaClient } from '@prisma/client';

// Cria a instância do Prisma — é ela que usamos para todas as operações no banco
// Pensa como uma "conexão inteligente" que sabe as tabelas, campos e relacionamentos
const prisma = new PrismaClient({
  // Define quais eventos o Prisma vai mostrar no terminal durante o desenvolvimento
  // 'query' → mostra cada SQL executado (útil para entender o que o Prisma faz por baixo)
  // 'error' → erros do banco
  // 'warn'  → avisos (ex: queries lentas)
  log: ['query', 'error', 'warn'],
});

// Exportamos como default para importar em qualquer arquivo com: import prisma from '../config/database'
export default prisma;
