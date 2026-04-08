import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  // enum valida que o valor é exatamente um dos permitidos
  source: z.enum(['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL', 'OTHER']).optional(),
  notes: z.string().optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL', 'OTHER']).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
  notes: z.string().optional(),
});
