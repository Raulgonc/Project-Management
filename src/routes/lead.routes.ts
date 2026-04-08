import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllLeads, getLeadById, createLead, updateLead, deleteLead, convertLead } from '../controllers/lead.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.delete('/:id', adminOnly, deleteLead);
router.post('/:id/convert', convertLead);

export default router;
