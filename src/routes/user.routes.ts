import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';

const router = Router();

// Aplica o authMiddleware em TODAS as rotas desse arquivo de uma vez
// Qualquer requisição sem token válido é barrada aqui antes de chegar nos controllers
router.use(authMiddleware);

// Cada rota pode ter múltiplos middlewares em sequência antes do controller
// Eles executam em ordem — se um falhar, os próximos não executam
// Exemplo da primeira rota:
//   authMiddleware (já aplicado acima) → adminOnly → getAllUsers
router.get('/', adminOnly, getAllUsers);       // Só ADMIN pode listar todos os usuários
router.get('/:id', getUserById);              // Qualquer usuário logado pode buscar por ID
router.patch('/:id', updateUser);             // Próprio usuário ou ADMIN pode editar
router.delete('/:id', adminOnly, deleteUser); // Só ADMIN pode deletar

export default router;
