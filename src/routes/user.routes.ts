import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';

const router = Router();

// Todas as rotas de usuário exigem estar logado
router.use(authMiddleware);

router.get('/', adminOnly, getAllUsers);       // Só ADMIN lista todos
router.get('/:id', getUserById);              // Qualquer usuário logado vê por ID
router.patch('/:id', updateUser);             // Próprio usuário ou ADMIN edita
router.delete('/:id', adminOnly, deleteUser); // Só ADMIN deleta

export default router;
