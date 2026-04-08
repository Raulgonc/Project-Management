import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  clientId: z.string().uuid('ID do cliente inválido'),
  managerId: z.string().uuid('ID do gerente inválido').optional(),
  // coerce converte string para number automaticamente — datas e números chegam como string no JSON
  budgetPlanned: z.coerce.number().positive('Orçamento deve ser positivo').optional(),
  startDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  managerId: z.string().uuid().optional(),
  budgetPlanned: z.coerce.number().positive().optional(),
  budgetActual: z.coerce.number().min(0).optional(),
  startDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
});
