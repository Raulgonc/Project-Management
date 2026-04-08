import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', validate(createProjectSchema), createProject);
router.patch('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', adminOnly, deleteProject);

export default router;
