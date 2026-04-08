import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllTasks, getTaskById, createTask, updateTask, deleteTask } from '../controllers/task.controller';

const router = Router();

// Todas as rotas de tarefas exigem autenticação
router.use(authMiddleware);

router.get('/', getAllTasks);                    // Filtrável por projectId, assigneeId, status, priority
router.get('/:id', getTaskById);
router.post('/', createTask);
router.patch('/:id', updateTask);               // Usado para mover status, atribuir responsável, etc.
router.delete('/:id', adminOnly, deleteTask);   // Só ADMIN pode deletar

export default router;
