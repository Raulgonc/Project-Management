import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  contractInfo: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  contractInfo: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => Object.values(data).some(Boolean), {
  message: 'Informe ao menos um campo para atualizar',
});
