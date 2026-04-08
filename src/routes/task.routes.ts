import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator';
import { getAllTasks, getTaskById, createTask, updateTask, deleteTask } from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', validate(createTaskSchema), createTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', adminOnly, deleteTask);

export default router;
