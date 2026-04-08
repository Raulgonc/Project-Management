import { Router } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';

// Router é um mini-servidor de rotas isolado do Express
// Agrupa as rotas de um módulo e depois é montado no main.ts com app.use('/auth', authRoutes)
const router = Router();

// Define os endpoints públicos de autenticação (não exigem token)
router.post('/register', registerController); // POST /auth/register
router.post('/login', loginController);       // POST /auth/login

export default router;
