import prisma from '../config/database';
import { LeadStatus, LeadSource } from '@prisma/client';

interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
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

interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
}

export async function findAll(filters: LeadFilters = {}) {
  return prisma.lead.findMany({
    where: {
      // Só aplica o filtro se o valor foi informado
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

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
  await findById(id);
  return prisma.lead.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  await findById(id);
  await prisma.lead.delete({ where: { id } });
}

export async function convertToClient(id: string) {
  const lead = await findById(id);

  // Não permite converter um lead que já foi convertido ou perdido
  if (lead.status === 'CONVERTED') {
    throw new Error('Lead já foi convertido');
  }
  if (lead.status === 'LOST') {
    throw new Error('Lead está marcado como perdido');
  }

  // Verifica se já existe um cliente com esse email
  const existingClient = await prisma.client.findUnique({ where: { email: lead.email } });
  if (existingClient) {
    throw new Error('Já existe um cliente com esse email');
  }

  // Usa uma transaction — as duas operações acontecem juntas ou nenhuma acontece
  return prisma.$transaction(async (tx) => {
    // Cria o cliente com os dados do lead
    const client = await tx.client.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
        leadId: lead.id,
      },
    });

    // Marca o lead como convertido
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
