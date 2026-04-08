import prisma from '../config/database';
import { LeadStatus, LeadSource } from '@prisma/client';

// Interfaces definem o "formato" dos dados esperados em cada operação
// O TypeScript usa isso para garantir que ninguém passe campos errados

interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;    // "?" = opcional
  company?: string;
  source?: LeadSource;
  notes?: string;
}

interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string;
}

// Filtros disponíveis na listagem — ex: /leads?status=NEW&source=WEBSITE
interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
}

// Lista todos os leads com filtros opcionais
export async function findAll(filters: LeadFilters = {}) {
  return prisma.lead.findMany({
    where: {
      // Spread condicional: só adiciona o filtro se o valor foi informado
      // Funciona como: "se filters.status existir, filtra por ele; senão, ignora"
      // Sem isso, um filtro vazio quebraria a query
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
    },
    orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
  });
}

// Busca um lead específico pelo ID
export async function findById(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    throw new Error('Lead não encontrado');
  }
  return lead;
}

export async function create(data: CreateLeadData) {
  return prisma.lead.create({ data });
}

export async function update(id: string, data: UpdateLeadData) {
  await findById(id); // Garante que o lead existe antes de atualizar
  return prisma.lead.update({ where: { id }, data });
}

export async function remove(id: string) {
  await findById(id); // Garante que o lead existe antes de deletar
  await prisma.lead.delete({ where: { id } });
}

// Converte um lead em cliente — ação central do funil de vendas
export async function convertToClient(id: string) {
  const lead = await findById(id);

  // Validações de negócio: não permite conversão em estados inválidos
  if (lead.status === 'CONVERTED') {
    throw new Error('Lead já foi convertido');
  }
  if (lead.status === 'LOST') {
    throw new Error('Lead está marcado como perdido');
  }

  // Verifica se já existe um cliente com esse email (pode ter sido criado manualmente)
  const existingClient = await prisma.client.findUnique({ where: { email: lead.email } });
  if (existingClient) {
    throw new Error('Já existe um cliente com esse email');
  }

  // Transaction: garante que as duas operações abaixo acontecem JUNTAS
  // Se uma falhar, a outra é desfeita automaticamente
  // Sem isso: poderia criar o cliente mas o lead continuar como NEW (inconsistência no banco)
  return prisma.$transaction(async (tx) => {
    // 1. Cria o cliente com os dados do lead
    const client = await tx.client.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
        leadId: lead.id, // Mantém a referência ao lead de origem
      },
    });

    // 2. Atualiza o lead para CONVERTED e registra quando aconteceu
    await tx.lead.update({
      where: { id },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
      },
    });

    return client;
  });
}
