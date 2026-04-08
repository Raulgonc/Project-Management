import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createLeadSchema, updateLeadSchema } from '../validators/lead.validator';
import { getAllLeads, getLeadById, createLead, updateLead, deleteLead, convertLead } from '../controllers/lead.controller';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: Listar todos os leads
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, QUALIFIED, CONVERTED, LOST]
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [WEBSITE, REFERRAL, SOCIAL_MEDIA, EMAIL, OTHER]
 *     responses:
 *       200:
 *         description: Lista de leads
 *   post:
 *     summary: Criar novo lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [WEBSITE, REFERRAL, SOCIAL_MEDIA, EMAIL, OTHER]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead criado com sucesso
 */

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     summary: Buscar lead por ID
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do lead
 *       404:
 *         description: Lead não encontrado
 *   patch:
 *     summary: Atualizar lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead atualizado
 *   delete:
 *     summary: Deletar lead (ADMIN)
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lead deletado
 */

/**
 * @swagger
 * /leads/{id}/convert:
 *   post:
 *     summary: Converter lead em cliente
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Cliente criado a partir do lead
 *       400:
 *         description: Lead já convertido ou perdido
 */
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.post('/', validate(createLeadSchema), createLead);
router.patch('/:id', validate(updateLeadSchema), updateLead);
router.delete('/:id', adminOnly, deleteLead);
router.post('/:id/convert', convertLead);

export default router;
