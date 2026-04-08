import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import prisma from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Permite que o frontend faça requisições para esta API
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Faz o servidor entender JSON no corpo das requisições
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Rota de health check — só para confirmar que o servidor está vivo
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Inicializa o servidor
async function main() {
  try {
    // Testa a conexão com o banco de dados antes de subir
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
