import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/client.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllClients);
router.get('/:id', getClientById);        // Retorna cliente + projetos + lead de origem
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', adminOnly, deleteClient);

export default router;
