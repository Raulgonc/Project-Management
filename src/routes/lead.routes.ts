import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllLeads, getLeadById, createLead, updateLead, deleteLead, convertLead } from '../controllers/lead.controller';

const router = Router();

// Todas as rotas de leads exigem autenticação
router.use(authMiddleware);

router.get('/', getAllLeads);                    // Lista todos (com filtros opcionais)
router.get('/:id', getLeadById);                // Busca um lead específico
router.post('/', createLead);                   // Cria novo lead
router.patch('/:id', updateLead);               // Atualiza dados do lead
router.delete('/:id', adminOnly, deleteLead);   // Só ADMIN pode deletar

// Rota de ação: converte o lead em cliente
// Usamos POST (não PATCH) porque não é apenas uma edição — é uma ação que cria outro recurso
router.post('/:id/convert', convertLead);

export default router;
