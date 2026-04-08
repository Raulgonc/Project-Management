import prisma from '../config/database';

interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  contractInfo?: string; // Informações do contrato com o cliente
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

// Lista todos os clientes — sem dados relacionados para manter a resposta leve
export async function findAll() {
  return prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

// Busca um cliente específico com todos os dados relacionados
export async function findById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      // "include" traz registros de outras tabelas relacionadas (diferente do "select" que escolhe campos)
      projects: true, // Todos os projetos desse cliente
      lead: true,     // O lead de origem, se esse cliente veio de uma conversão
    },
  });

  if (!client) {
    throw new Error('Cliente não encontrado');
  }

  return client;
}

// Cria um cliente manualmente (sem precisar passar pelo funil de leads)
export async function create(data: CreateClientData) {
  // Email deve ser único — dois clientes não podem ter o mesmo email
  const existingClient = await prisma.client.findUnique({ where: { email: data.email } });
  if (existingClient) {
    throw new Error('Já existe um cliente com esse email');
  }

  return prisma.client.create({ data });
}

export async function update(id: string, data: UpdateClientData) {
  await findById(id);

  // Se um novo email foi enviado, verifica se já está em uso por outro cliente
  if (data.email) {
    const emailInUse = await prisma.client.findFirst({
      where: { email: data.email, NOT: { id } }, // NOT: { id } exclui o próprio cliente da checagem
    });
    if (emailInUse) {
      throw new Error('Email já está em uso');
    }
  }

  return prisma.client.update({ where: { id }, data });
}

export async function remove(id: string) {
  await findById(id);
  await prisma.client.delete({ where: { id } });
}
