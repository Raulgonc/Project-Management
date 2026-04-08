import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';

const router = Router();

// Todas as rotas de projetos exigem autenticação
router.use(authMiddleware);

router.get('/', getAllProjects);                    // Filtrável por status e clientId via query params
router.get('/:id', getProjectById);                // Retorna projeto + tarefas + cliente + gerente
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', adminOnly, deleteProject);   // Só ADMIN pode deletar

export default router;
