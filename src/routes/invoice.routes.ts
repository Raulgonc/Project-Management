import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getAllInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoice.controller';

const router = Router();

// Todas as rotas de faturas exigem autenticação
router.use(authMiddleware);

router.get('/', getAllInvoices);                    // Filtrável por clientId e status
router.get('/:id', getInvoiceById);                // Retorna fatura + itens + cliente + projeto
router.post('/', createInvoice);                   // Cria fatura com itens em uma só requisição
router.patch('/:id', updateInvoice);               // Atualiza status (DRAFT → SENT → PAID), vencimento, etc.
router.delete('/:id', adminOnly, deleteInvoice);   // Só ADMIN pode deletar

export default router;
