import prisma from '../config/database';

interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  contractInfo?: string;
  notes?: string;
}

interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  contractInfo?: string;
  notes?: string;
}

export async function findAll() {
  return prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: true,  // Traz os projetos do cliente junto
      lead: true,      // Traz o lead de origem, se existir
    },
  });

  if (!client) {
    throw new Error('Cliente não encontrado');
  }

  return client;
}

export async function create(data: CreateClientData) {
  const existingClient = await prisma.client.findUnique({ where: { email: data.email } });
  if (existingClient) {
    throw new Error('Já existe um cliente com esse email');
  }

  return prisma.client.create({ data });
}

export async function update(id: string, data: UpdateClientData) {
  await findById(id);

  if (data.email) {
    const emailInUse = await prisma.client.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (emailInUse) {
      throw new Error('Email já está em uso');
    }
  }

  return prisma.client.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  await findById(id);
  await prisma.client.delete({ where: { id } });
}
