import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '../validators/user.validator';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', adminOnly, getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', adminOnly, deleteUser);

export default router;
