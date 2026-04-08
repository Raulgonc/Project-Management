import { z } from 'zod';

// Schema de cada item da fatura
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Descrição do item é obrigatória'),
  quantity: z.coerce.number().positive('Quantidade deve ser positiva'),
  unitPrice: z.coerce.number().positive('Preço unitário deve ser positivo'),
  total: z.coerce.number().positive('Total deve ser positivo'),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  projectId: z.string().uuid('ID do projeto inválido').optional(),
  billingType: z.enum(['HOURLY', 'FIXED', 'MILESTONE']).optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  // array com pelo menos 1 item — fatura sem itens não faz sentido
  items: z.array(invoiceItemSchema).min(1, 'A fatura precisa ter ao menos um item'),
});

export const updateInvoiceSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  billingType: z.enum(['HOURLY', 'FIXED', 'MILESTONE']).optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});
