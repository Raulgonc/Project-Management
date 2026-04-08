import prisma from '../config/database';

// Campos que sempre retornamos — senha nunca sai
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export async function findAll() {
  return prisma.user.findMany({ select: userSelect });
}

export async function findById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  return user;
}

export async function update(id: string, data: { name?: string; email?: string }) {
  // Verifica se o usuário existe antes de tentar atualizar
  await findById(id);

  // Se vier um novo email, verifica se já está em uso por outro usuário
  if (data.email) {
    const emailInUse = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (emailInUse) {
      throw new Error('Email já está em uso');
    }
  }

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function remove(id: string) {
  await findById(id);
  await prisma.user.delete({ where: { id } });
}
