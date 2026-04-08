import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createClientSchema, updateClientSchema } from '../validators/client.validator';
import { getAllClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/client.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', validate(createClientSchema), createClient);
router.patch('/:id', validate(updateClientSchema), updateClient);
router.delete('/:id', adminOnly, deleteClient);

export default router;
