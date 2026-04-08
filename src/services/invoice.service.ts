import prisma from '../config/database';
import { InvoiceStatus, BillingType } from '@prisma/client';

// Cada item da fatura representa um serviço ou produto cobrado
interface InvoiceItemData {
  description: string;
  quantity: number;    // Quantidade (horas, unidades, etc.)
  unitPrice: number;   // Preço por unidade
  total: number;       // quantity * unitPrice — calculado antes de enviar
}

interface CreateInvoiceData {
  clientId: string;
  projectId?: string;    // Fatura pode ou não estar vinculada a um projeto
  billingType?: BillingType;
  dueDate?: Date;
  notes?: string;
  items: InvoiceItemData[]; // Uma fatura precisa ter ao menos um item
}

interface UpdateInvoiceData {
  status?: InvoiceStatus;
  billingType?: BillingType;
  dueDate?: Date;
  notes?: string;
}

// Filtros disponíveis na listagem
// Ex: /invoices?clientId=abc | /invoices?status=OVERDUE
interface InvoiceFilters {
  clientId?: string;
  status?: InvoiceStatus;
}

// Gera um número único para a fatura no formato INV-000001
// Conta quantas faturas existem e incrementa — simples e legível
async function generateInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  const number = String(count + 1).padStart(6, '0'); // "1" vira "000001"
  return `INV-${number}`;
}

export async function findAll(filters: InvoiceFilters = {}) {
  return prisma.invoice.findMany({
    where: {
      ...(filters.clientId && { clientId: filters.clientId }),
      ...(filters.status && { status: filters.status }),
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
      items: true, // Sempre traz os itens da fatura
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
      items: true,
    },
  });

  if (!invoice) {
    throw new Error('Fatura não encontrada');
  }

  return invoice;
}

export async function create(data: CreateInvoiceData) {
  // Verifica se o cliente existe
  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) {
    throw new Error('Cliente não encontrado');
  }

  // Se um projeto foi informado, verifica se existe
  if (data.projectId) {
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      throw new Error('Projeto não encontrado');
    }
  }

  // Fatura precisa ter pelo menos um item
  if (!data.items || data.items.length === 0) {
    throw new Error('A fatura precisa ter ao menos um item');
  }

  const number = await generateInvoiceNumber();

  // Transaction: cria a fatura e todos os itens juntos
  // Se a criação de qualquer item falhar, a fatura inteira é desfeita
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        number,
        clientId: data.clientId,
        projectId: data.projectId,
        billingType: data.billingType,
        dueDate: data.dueDate,
        notes: data.notes,
        // "create many" dentro da criação da fatura — cria todos os itens de uma vez
        items: { create: data.items },
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        items: true,
      },
    });

    return invoice;
  });
}

export async function update(id: string, data: UpdateInvoiceData) {
  const invoice = await findById(id);

  // Fatura paga ou cancelada não pode ser editada
  if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
    throw new Error('Não é possível editar uma fatura paga ou cancelada');
  }

  // Se o status mudou para PAID, registra a data de pagamento automaticamente
  const paidAt = data.status === 'PAID' ? new Date() : undefined;

  return prisma.invoice.update({
    where: { id },
    data: { ...data, ...(paidAt && { paidAt }) },
  });
}

export async function remove(id: string) {
  await findById(id);
  // O Prisma deleta os itens automaticamente por causa do "onDelete: Cascade" no schema
  await prisma.invoice.delete({ where: { id } });
}
