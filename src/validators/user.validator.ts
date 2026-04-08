import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
// Garante que pelo menos um campo foi enviado — sem isso, um body vazio seria aceito
}).refine((data) => data.name || data.email, {
  message: 'Informe ao menos um campo para atualizar',
});
