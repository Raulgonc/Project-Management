import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import prisma from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import leadRoutes from './routes/lead.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import invoiceRoutes from './routes/invoice.routes';
import { errorHandler } from './middleware/error.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app = express();

// CORS (Cross-Origin Resource Sharing): define quem pode fazer requisições para esta API
// Sem isso, o navegador bloquearia chamadas do frontend por segurança
app.use(cors({
  origin: env.ALLOWED_ORIGINS,             // Só o frontend em localhost:4200 é permitido
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],  // Headers permitidos (Authorization é para o token JWT)
}));

// Permite que o servidor leia JSON no corpo das requisições
// Sem essa linha, req.body viria como undefined nos controllers
app.use(express.json());

// Documentação Swagger — acessível em http://localhost:3000/docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Montagem das rotas — cada módulo tem seu prefixo de URL
// Exemplo: qualquer rota começando com /auth vai para authRoutes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/leads', leadRoutes);
app.use('/clients', clientRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/invoices', invoiceRoutes);

// Rota de health check — confirma que o servidor está rodando
// Útil em produção para monitoramento automático e deploys
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Middleware de erros — deve ficar por último, depois de todas as rotas
// O Express reconhece esse middleware pelos 4 parâmetros (err, req, res, next)
app.use(errorHandler);

// Função principal que inicializa o servidor
async function main() {
  try {
    // Testa a conexão com o banco ANTES de subir o servidor
    // Se o banco estiver fora, o servidor nem tenta subir — evita erros silenciosos
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // process.exit(1) encerra o processo com código de erro — avisa que algo deu errado
    process.exit(1);
  }
}

main();
