import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoice.validator';
import { getAllInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoice.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', validate(createInvoiceSchema), createInvoice);
router.patch('/:id', validate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', adminOnly, deleteInvoice);

export default router;
